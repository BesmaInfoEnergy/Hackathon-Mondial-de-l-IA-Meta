export interface SampleCase {
  id: string;
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  filename: string;
  language: string;
  cloudTarget: 'AWS' | 'Azure' | 'GCP';
  modernizationGoal: 'Event-Driven Microservices (Kafka/EDA)' | 'Serverless Cloud Functions (Lambda/Cloud Run)' | 'Containerized Kubernetes (EKS/GKE/AKS)' | 'Modernized Modular Monolith';
  compliance: ('PCI-DSS' | 'GDPR' | 'ISO 27001' | 'HIPAA' | 'SOC 2')[];
  code: string;
  descriptionEn: string;
  descriptionAr: string;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'java-ee-ejb',
    titleEn: 'Java EE 6 Monolithic EJB & WebLogic Order Processor',
    titleAr: 'نظام معالجة الطلبات الأحادي Java EE 6 وخادم WebLogic',
    categoryEn: 'Enterprise E-Commerce / Retail Core',
    categoryAr: 'نظم التجارة الإلكترونية والتجزئة الكبرى',
    filename: 'OrderProcessingBean.java',
    language: 'Java',
    cloudTarget: 'AWS',
    modernizationGoal: 'Event-Driven Microservices (Kafka/EDA)',
    compliance: ['PCI-DSS', 'GDPR', 'ISO 27001'],
    descriptionEn: 'Monolithic Stateless Session Bean with raw JDBC, hardcoded DB credentials, synchronous blocking partner calls, and zero circuit breaking.',
    descriptionAr: 'مكون أحادي EJB يعتمد على استدعاءات متزامنة معطلة، وبيانات اعتماد مضمنة في الشفرة، واتصالات JDBC يدوية تفتقر للمرونة.',
    code: `package com.enterprise.orders.ejb;

import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.naming.InitialContext;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Date;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Legacy Monolithic Order & Billing God-Bean
 * Deployed on Oracle WebLogic 10.3 / Java EE 6 (2011)
 * Technical Debt: High coupling, hardcoded secrets, SQL injection risk, blocking synchronous HTTP
 */
@Stateless
public class OrderProcessingBean {

    // HARDCODED PRODUCTION SECRETS (PCI-DSS & ISO 27001 Violation)
    private static final String DB_URL = "jdbc:oracle:thin:@prod-db-cluster-01.corp.internal:1521/PROD";
    private static final String DB_USER = "order_admin";
    private static final String DB_PASS = "EnterpriseProdSecret2011#Key!";
    private static final String FRAUD_API_ENDPOINT = "http://legacy-fraud-gateway.local/verify";

    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public boolean processCustomerOrder(String customerId, String creditCardNumber, String cvv, double amount, String[] itemIds) {
        Connection conn = null;
        Statement stmt = null;
        try {
            System.out.println("[AUDIT LOG] Processing order for customer: " + customerId + " at " + new Date());

            // VULNERABILITY: Cleartext PAN storage & lack of tokenization (PCI-DSS Req 3.4)
            Class.forName("oracle.jdbc.driver.OracleDriver");
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            stmt = conn.createStatement();

            // VULNERABILITY: Critical SQL Injection via Dynamic String Concatenation (CWE-89)
            String sql = "SELECT balance, credit_limit, risk_score FROM customer_accounts " +
                         "WHERE customer_id = '" + customerId + "' AND active_status = 1";
            ResultSet rs = stmt.executeQuery(sql);

            if (!rs.next()) {
                System.err.println("Customer not found or inactive: " + customerId);
                return false;
            }

            double balance = rs.getDouble("balance");
            double limit = rs.getDouble("credit_limit");

            if ((balance + amount) > limit) {
                System.err.println("Credit limit exceeded for customer: " + customerId);
                return false;
            }

            // ANTI-PATTERN: Synchronous blocking call inside distributed transaction without circuit breaker
            URL url = new URL(FRAUD_API_ENDPOINT + "?cc=" + creditCardNumber + "&amt=" + amount);
            HttpURLConnection http = (HttpURLConnection) url.openConnection();
            http.setRequestMethod("GET");
            http.setConnectTimeout(60000); // 60s timeout holds database connection pool hostage!
            int responseCode = http.getResponseCode();

            if (responseCode != 200) {
                System.err.println("Fraud verification gateway failed with code: " + responseCode);
                return false;
            }

            // Update balance and insert order
            String updateSql = "UPDATE customer_accounts SET balance = " + (balance + amount) + 
                               ", last_order_date = SYSDATE WHERE customer_id = '" + customerId + "'";
            stmt.executeUpdate(updateSql);

            String orderId = "ORD-" + System.currentTimeMillis();
            String insertOrderSql = "INSERT INTO orders (order_id, customer_id, card_number_clear, amount, status) " +
                                   "VALUES ('" + orderId + "', '" + customerId + "', '" + creditCardNumber + "', " + amount + ", 'COMPLETED')";
            stmt.executeUpdate(insertOrderSql);

            // MONOLITHIC COUPLING: Directly updating inventory within the same stovepipe table
            for (String itemId : itemIds) {
                String invSql = "UPDATE inventory SET stock_qty = stock_qty - 1 WHERE item_id = '" + itemId + "'";
                stmt.executeUpdate(invSql);
            }

            return true;
        } catch (Exception e) {
            // ANTI-PATTERN: Generic catch swallows root cause and leaks stack traces
            e.printStackTrace();
            throw new RuntimeException("Order processing transaction aborted: " + e.getMessage());
        } finally {
            // RESOURCE LEAK: Statement and ResultSet not closed in safe reverse order
            try {
                if (conn != null) conn.close();
            } catch (Exception ignored) {}
        }
    }
}`
  },
  {
    id: 'cobol-banking',
    titleEn: 'COBOL CICS Mainframe Batch Account Settlement',
    titleAr: 'نظام تسوية الحسابات البنكية بلغة COBOL على الحواسيب المركزية',
    categoryEn: 'Core Banking / Financial Ledger',
    categoryAr: 'النظم المصرفية الأساسية ودفاتر الأستاذ المالية',
    filename: 'ACCT010.cbl',
    language: 'COBOL',
    cloudTarget: 'AWS',
    modernizationGoal: 'Event-Driven Microservices (Kafka/EDA)',
    compliance: ['PCI-DSS', 'ISO 27001', 'SOC 2'],
    descriptionEn: 'IBM z/OS Mainframe sequential EBCDIC batch processor with fixed memory layouts, arithmetic overflow risk, and high operational mainframe MIPS cost.',
    descriptionAr: 'برنامج حاسوب مركزي لمعالجة الدفعات البنكية بملفات تسلسلية وتكاليف تشغيل مرتفعة للموارد الحاسوبية (MIPS).',
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID.    ACCT010.
       AUTHOR.        CORE-BANKING-MAINTENANCE-1988.
       INSTALLATION.  ZOS-MAINFRAME-SYS1.
       DATE-WRITTEN.  OCTOBER 1988.
      *****************************************************************
      * BATCH SETTLEMENT & DAILY INTEREST ACCRUAL ENGINE              *
      * TECHNICAL DEBT: MONOLITHIC SEQUENTIAL IO, MEMORY BOUNDS,      *
      * MIPS INEFFICIENCY, TOTAL LACK OF OBSERVABILITY                *
      *****************************************************************
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT ACCT-IN-FILE ASSIGN TO UT-S-ACCTIN
               ORGANIZATION IS SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-IN-STATUS.
           SELECT ACCT-OUT-FILE ASSIGN TO UT-S-ACCTOUT
               ORGANIZATION IS SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-OUT-STATUS.
       DATA DIVISION.
       FILE SECTION.
       FD  ACCT-IN-FILE
           RECORDING MODE IS F
           RECORD CONTAINS 80 CHARACTERS.
       01  ACCT-IN-RECORD.
           05  IN-ACCT-NUMBER      PIC X(10).
           05  IN-ACCT-TYPE        PIC X(02).
           05  IN-BALANCE          PIC 9(09)V99.
           05  IN-INTEREST-RATE    PIC 9(02)V999.
           05  IN-LAST-UPDATE      PIC X(08).
           05  FILLER              PIC X(45).

       FD  ACCT-OUT-FILE
           RECORDING MODE IS F
           RECORD CONTAINS 80 CHARACTERS.
       01  ACCT-OUT-RECORD.
           05  OUT-ACCT-NUMBER     PIC X(10).
           05  OUT-NEW-BALANCE     PIC 9(09)V99.
           05  OUT-INTEREST-ACCR   PIC 9(07)V99.
           05  OUT-STATUS-CODE     PIC X(02).
           05  FILLER              PIC X(51).

       WORKING-STORAGE SECTION.
       01  WS-COUNTERS.
           05  WS-RECORDS-READ     PIC 9(08) VALUE ZERO.
           05  WS-RECORDS-WRITTEN  PIC 9(08) VALUE ZERO.
           05  WS-TOTAL-INTEREST   PIC 9(12)V99 VALUE ZERO.
           05  WS-IN-STATUS        PIC X(02) VALUE SPACES.
           05  WS-OUT-STATUS       PIC X(02) VALUE SPACES.
           05  WS-EOF-FLAG         PIC X(01) VALUE 'N'.

       01  WS-CALC-VARS.
           05  WS-DAILY-INT        PIC 9(07)V99 VALUE ZERO.
           05  WS-TEMP-BAL         PIC 9(09)V99 VALUE ZERO.

       PROCEDURE DIVISION.
       0000-MAIN-CONTROL.
           PERFORM 1000-INITIALIZE
           PERFORM 2000-PROCESS-RECORDS UNTIL WS-EOF-FLAG = 'Y'
           PERFORM 3000-TERMINATE
           STOP RUN.

       1000-INITIALIZE.
           OPEN INPUT ACCT-IN-FILE
           OPEN OUTPUT ACCT-OUT-FILE
           IF WS-IN-STATUS NOT = '00'
               DISPLAY 'FATAL: CANNOT OPEN INPUT FILE STATUS=' WS-IN-STATUS
               PERFORM 9999-ABORT
           END-IF.

       2000-PROCESS-RECORDS.
           READ ACCT-IN-FILE
               AT END
                   MOVE 'Y' TO WS-EOF-FLAG
               NOT AT END
                   ADD 1 TO WS-RECORDS-READ
                   PERFORM 2500-CALCULATE-INTEREST
           END-READ.

       2500-CALCULATE-INTEREST.
      * POTENTIAL ARITHMETIC TRUNCATION ON OVERFLOW
           COMPUTE WS-DAILY-INT ROUNDED = 
               (IN-BALANCE * (IN-INTEREST-RATE / 100)) / 365
           ADD WS-DAILY-INT TO WS-TOTAL-INTEREST
           COMPUTE WS-TEMP-BAL = IN-BALANCE + WS-DAILY-INT

           MOVE IN-ACCT-NUMBER TO OUT-ACCT-NUMBER
           MOVE WS-TEMP-BAL TO OUT-NEW-BALANCE
           MOVE WS-DAILY-INT TO OUT-INTEREST-ACCR
           MOVE 'OK' TO OUT-STATUS-CODE

           WRITE ACCT-OUT-RECORD
           ADD 1 TO WS-RECORDS-WRITTEN.

       3000-TERMINATE.
           CLOSE ACCT-IN-FILE
           CLOSE ACCT-OUT-FILE
           DISPLAY 'SETTLEMENT COMPLETE. READ=' WS-RECORDS-READ
                   ' WRITTEN=' WS-RECORDS-WRITTEN.

       9999-ABORT.
           DISPLAY 'SYSTEM ABEND: CODE 777'
           CALL 'ILBOABN0' USING BY VALUE 777.`
  },
  {
    id: 'sql-god-proc',
    titleEn: 'Monolithic T-SQL Stored Procedure & C# WCF Billing Service',
    titleAr: 'إجراء مخزن ضخم T-SQL وخدمة الفوترة WCF بلغة C#',
    categoryEn: 'Telecommunications & Utilities Billing',
    categoryAr: 'نظم الفواتير للاتصالات والمرافق العامة',
    filename: 'sp_ProcessBilling_v4.sql',
    language: 'SQL',
    cloudTarget: 'Azure',
    modernizationGoal: 'Containerized Kubernetes (EKS/GKE/AKS)',
    compliance: ['PCI-DSS', 'GDPR', 'SOC 2'],
    descriptionEn: '3,500-line God Procedure with dynamic SQL injection, table-wide exclusive locks, cleartext cardholder details, and unindexed cursor loops.',
    descriptionAr: 'إجراء مخزن هائل يحتوي على استعلامات ديناميكية عرضة للاختراق وحجز حصري للجداول بدون فهرسة كافية.',
    code: `-- Monolithic Core Billing Procedure: sp_ProcessBilling_v4
-- Written in 2007 for Microsoft SQL Server 2005 / 2008
-- Technical Debt: God-procedure anti-pattern, dynamic SQL concatenation, row locking contention

CREATE PROCEDURE [dbo].[sp_ProcessBilling_v4]
    @BillingCycleId INT,
    @TenantFilter VARCHAR(50),
    @EnforceAuditBit INT,
    @DebugMode INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION BillingTx;

    DECLARE @SqlDynamic NVARCHAR(MAX);
    DECLARE @CustomerId INT;
    DECLARE @CustomerPan VARCHAR(30);
    DECLARE @TotalBilledAmount DECIMAL(18,2);

    -- VULNERABILITY: Dynamic SQL concatenation creates severe CWE-89 injection risk
    SET @SqlDynamic = 'SELECT customer_id, card_number_clear, monthly_tier ' +
                      'FROM dbo.tbl_BillingSubscribers WITH (TABLOCKX) ' +
                      'WHERE billing_cycle = ' + CAST(@BillingCycleId AS VARCHAR) + 
                      ' AND tenant_code = ''' + @TenantFilter + '''';

    IF @DebugMode = 1
    BEGIN
        PRINT 'Executing SQL: ' + @SqlDynamic;
    END

    -- Dynamic execution of unsanitized string
    EXEC sp_executesql @SqlDynamic;

    -- ANTI-PATTERN: Slow RBAR (Row-By-Agonizing-Row) Cursor locking entire production DB
    DECLARE billing_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT customer_id, raw_pan_number, unbilled_usage_amount
        FROM dbo.tbl_BillingSubscribers
        WHERE billing_cycle = @BillingCycleId AND is_settled = 0;

    OPEN billing_cursor;
    FETCH NEXT FROM billing_cursor INTO @CustomerId, @CustomerPan, @TotalBilledAmount;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Cleartext PAN exposed in audit trail (PCI-DSS 3.4 Non-compliance)
        IF @EnforceAuditBit = 1
        BEGIN
            INSERT INTO dbo.tbl_BillingAuditLog (customer_id, raw_pan, billed_amt, log_time)
            VALUES (@CustomerId, @CustomerPan, @TotalBilledAmount, GETDATE());
        END

        -- Simulating heavy cross-database monolithic join
        UPDATE LegacyERP.dbo.tbl_GeneralLedger WITH (ROWLOCK)
        SET account_receivable = account_receivable + @TotalBilledAmount,
            last_reconciled = GETDATE()
        WHERE account_code = 'AR_' + CAST(@CustomerId AS VARCHAR);

        UPDATE dbo.tbl_BillingSubscribers
        SET is_settled = 1,
            settled_timestamp = GETDATE()
        WHERE customer_id = @CustomerId;

        FETCH NEXT FROM billing_cursor INTO @CustomerId, @CustomerPan, @TotalBilledAmount;
    END

    CLOSE billing_cursor;
    DEALLOCATE billing_cursor;

    COMMIT TRANSACTION BillingTx;
    SELECT 'BILLING_BATCH_SUCCESS' AS ExecutionStatus, @BillingCycleId AS ProcessedCycle;
END`
  },
  {
    id: 'cpp-telecom-daemon',
    titleEn: 'C++ Telecom CDR Processing Daemon & Raw Socket Engine',
    titleAr: 'محرك اتصالات C++ لمعالجة سجلات المكالمات ومقابس الشبكة',
    categoryEn: 'Telecom Network Operations',
    categoryAr: 'عمليات شبكات الاتصالات والبنية التحتية',
    filename: 'cdr_collector.cpp',
    language: 'C++',
    cloudTarget: 'GCP',
    modernizationGoal: 'Serverless Cloud Functions (Lambda/Cloud Run)',
    compliance: ['GDPR', 'ISO 27001'],
    descriptionEn: 'Legacy POSIX daemon with raw pointer arithmetic, unbounded strcpy buffer overflows, unhandled thread race conditions, and lack of container readiness.',
    descriptionAr: 'برنامج خلفي بلغة C++ يعاني من مؤشرات الذاكرة الخام وخطر تدفق المخزن المؤقت وغياب الحاويات البرمجية.',
    code: `// Legacy Telecom Call Detail Record (CDR) Ingestion Daemon
// Compiled with GCC 4.1 on RHEL 5 (2009)
// Technical Debt: Raw memory allocation, buffer overflow vulnerabilities, thread deadlocks

#include <iostream>
#include <cstring>
#include <cstdlib>
#include <pthread.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define MAX_BUFFER 256
#define MAX_WORKERS 8

pthread_mutex_t g_mutex = PTHREAD_MUTEX_INITIALIZER;
int g_total_cdrs_processed = 0;

struct CDR_Record {
    char caller_id[32];
    char callee_id[32];
    char cell_tower_id[16];
    long duration_seconds;
    double tariff_rate;
};

// VULNERABILITY: CWE-120 Buffer Overflow via unsafe strcpy and sprintf
void parse_raw_packet(char* raw_stream, CDR_Record* out_record) {
    char local_buf[MAX_BUFFER];
    
    // UNSAFE: Unbounded copy can overflow local stack if input exceeds 256 bytes
    strcpy(local_buf, raw_stream);

    char* token = strtok(local_buf, "|");
    if (token) strcpy(out_record->caller_id, token);

    token = strtok(NULL, "|");
    if (token) strcpy(out_record->callee_id, token);

    token = strtok(NULL, "|");
    if (token) strcpy(out_record->cell_tower_id, token);

    token = strtok(NULL, "|");
    if (token) out_record->duration_seconds = atol(token);

    out_record->tariff_rate = 0.045; // Hardcoded billing rate
}

void* worker_thread(void* arg) {
    int client_socket = *(int*)arg;
    
    // MEMORY LEAK: Raw pointer malloc without RAII smart pointers
    char* network_buffer = (char*)malloc(2048);
    ssize_t bytes_read = read(client_socket, network_buffer, 2048);

    if (bytes_read > 0) {
        CDR_Record rec;
        parse_raw_packet(network_buffer, &rec);

        // DEADLOCK RISK: Non-reentrant lock without timeout or exception safety
        pthread_mutex_lock(&g_mutex);
        g_total_cdrs_processed++;
        std::cout << "[WORKER] Ingested CDR from " << rec.caller_id 
                  << " -> " << rec.callee_id 
                  << " (Total: " << g_total_cdrs_processed << ")" << std::endl;
        pthread_mutex_unlock(&g_mutex);
    }

    // Leaking network_buffer on socket error branch
    free(network_buffer);
    close(client_socket);
    return NULL;
}

int main(int argc, char* argv[]) {
    std::cout << "[SI-Modernize AI Audit Target] Starting CDR Collector Daemon v2.1 (2009)..." << std::endl;
    // Daemon lacks structured healthchecks, metrics, or graceful shutdown handling
    while (true) {
        sleep(10);
    }
    return 0;
}`
  }
];
