# Finance Tracker API Documentation

## 1. Authentication

### 1.1 Register a User
- **Endpoint:** `POST /api/register`
- **Description:** Mendaftar pengguna baru.
- **Request Body:**
    ```json
    {
        "email": "user@example.com",
        "password": "strongpassword"
    }
    ```
- **Response:**
    ```json
    {
        "message": "Registration successful",
        "userId": "12345"
    }
    ```

### 1.2 Login a User
- **Endpoint:** `POST /api/login`
- **Description:** Masuk dengan akun pengguna yang sudah terdaftar.
- **Request Body:**
    ```json
    {
        "email": "user@example.com",
        "password": "strongpassword"
    }
    ```
- **Response:**
    ```json
    {
        "message": "Login successful",
        "accessToken": "JWT-token"
    }
    ```

---

## 2. Financial Transactions

### 2.1 Get Transactions
- **Endpoint:** `GET /api/transactions`
- **Description:** Mendapatkan daftar transaksi keuangan pengguna.
- **Response:**
    ```json
    [
        {
            "transactionId": "1",
            "amount": 150000,
            "category": "Makanan",
            "type": "expense",
            "date": "2025-04-22",
            "description": "Makan siang"
        },
        {
            "transactionId": "2",
            "amount": 3000000,
            "category": "Gaji",
            "type": "income",
            "date": "2025-04-15",
            "description": "Gaji bulan April"
        }
    ]
    ```

### 2.2 Add a Transaction
- **Endpoint:** `POST /api/transactions`
- **Description:** Menambahkan transaksi keuangan baru.
- **Request Body:**
    ```json
    {
        "amount": 200000,
        "category": "Transportasi",
        "type": "expense",
        "date": "2025-04-20",
        "description": "Biaya bensin"
    }
    ```
- **Response:**
    ```json
    {
        "message": "Transaction added successfully",
        "transactionId": "3"
    }
    ```

### 2.3 Update a Transaction
- **Endpoint:** `PUT /api/transactions/:id`
- **Description:** Memperbarui informasi transaksi yang sudah ada.
- **Request Body:**
    ```json
    {
        "amount": 250000,
        "category": "Transportasi",
        "type": "expense",
        "date": "2025-04-21",
        "description": "Biaya parkir"
    }
    ```
- **Response:**
    ```json
    {
        "message": "Transaction updated successfully"
    }
    ```

### 2.4 Delete a Transaction
- **Endpoint:** `DELETE /api/transactions/:id`
- **Description:** Menghapus transaksi keuangan.
- **Response:**
    ```json
    {
        "message": "Transaction deleted successfully"
    }
    ```

---

## 3. Budgeting

### 3.1 Get Budgets
- **Endpoint:** `GET /api/budgets`
- **Description:** Mendapatkan daftar anggaran yang ditetapkan oleh pengguna.
- **Response:**
    ```json
    [
        {
            "category": "Makanan",
            "amount": 1500000,
            "spent": 1200000
        },
        {
            "category": "Transportasi",
            "amount": 500000,
            "spent": 300000
        }
    ]
    ```

### 3.2 Set a Budget
- **Endpoint:** `POST /api/budgets`
- **Description:** Menetapkan anggaran untuk kategori tertentu.
- **Request Body:**
    ```json
    {
        "category": "Hiburan",
        "amount": 1000000
    }
    ```
- **Response:**
    ```json
    {
        "message": "Budget set successfully"
    }
    ```

### 3.3 Update a Budget
- **Endpoint:** `PUT /api/budgets/:id`
- **Description:** Memperbarui anggaran untuk kategori tertentu.
- **Request Body:**
    ```json
    {
        "category": "Hiburan",
        "amount": 1200000
    }
    ```
- **Response:**
    ```json
    {
        "message": "Budget updated successfully"
    }
    ```

### 3.4 Delete a Budget
- **Endpoint:** `DELETE /api/budgets/:id`
- **Description:** Menghapus anggaran untuk kategori tertentu.
- **Response:**
    ```json
    {
        "message": "Budget deleted successfully"
    }
    ```

---

## 4. Reports and Analytics

### 4.1 Get Financial Report
- **Endpoint:** `GET /api/reports`
- **Description:** Mendapatkan laporan keuangan untuk pengguna.
- **Response:**
    ```json
    {
        "totalIncome": 5000000,
        "totalExpenses": 3000000,
        "balance": 2000000,
        "categories": {
            "Makanan": 800000,
            "Transportasi": 400000,
            "Hiburan": 600000
        }
    }
    ```

---

## 5. Bill Management and Reminders

### 5.1 Add a Bill
- **Endpoint:** `POST /api/bills`
- **Description:** Menambahkan tagihan (misalnya: cicilan, biaya langganan).
- **Request Body:**
    ```json
    {
        "billName": "Internet",
        "amount": 300000,
        "dueDate": "2025-05-01",
        "category": "Utilities"
    }
    ```
- **Response:**
    ```json
    {
        "message": "Bill added successfully",
        "billId": "1"
    }
    ```

### 5.2 Get Bills
- **Endpoint:** `GET /api/bills`
- **Description:** Mendapatkan daftar tagihan yang harus dibayar.
- **Response:**
    ```json
    [
        {
            "billId": "1",
            "billName": "Internet",
            "amount": 300000,
            "dueDate": "2025-05-01",
            "category": "Utilities"
        }
    ]
    ```

### 5.3 Update a Bill
- **Endpoint:** `PUT /api/bills/:id`
- **Description:** Memperbarui informasi tagihan (misalnya: jumlah atau tanggal jatuh tempo).
- **Request Body:**
    ```json
    {
        "billName": "Internet",
        "amount": 350000,
        "dueDate": "2025-05-05",
        "category": "Utilities"
    }
    ```
- **Response:**
    ```json
    {
        "message": "Bill updated successfully"
    }
    ```

### 5.4 Delete a Bill
- **Endpoint:** `DELETE /api/bills/:id`
- **Description:** Menghapus tagihan.
- **Response:**
    ```json
    {
        "message": "Bill deleted successfully"
    }
    ```

### 5.5 Set Bill Reminder
- **Endpoint:** `POST /api/bills/reminder`
- **Description:** Menetapkan pengingat untuk tagihan.
- **Request Body:**
    ```json
    {
        "billId": "1",
        "reminderDate": "2025-04-30"
    }
    ```
- **Response:**
    ```json
    {
        "message": "Reminder set successfully"
    }
    ```

---

## Teknologi yang Digunakan

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (dengan Mongoose) atau PostgreSQL
- **Autentikasi:** JWT (JSON Web Token)
- **Keamanan:** bcrypt untuk enkripsi kata sandi

---

## Pengaturan Proyek

1. **Instalasi Dependencies:**
    ```bash
    npm install express mongoose bcryptjs jsonwebtoken dotenv
    ```

2. **Menjalankan Server:**
    ```bash
    node app.js
    ```

---

Dokumentasi ini memberikan gambaran tentang cara menggunakan API untuk aplikasi **Finance Tracker** dengan berbagai fitur tambahan seperti manajemen tagihan dan pengingat.

