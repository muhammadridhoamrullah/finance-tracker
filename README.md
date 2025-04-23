# Finance Tracker API Documentation

## **Relasi Antara Model-Model**

Aplikasi **Finance Tracker** menggunakan **relasi One-to-Many** untuk menghubungkan model-model yang ada dalam sistem. Berikut adalah penjelasan dan implementasi setiap model beserta relasinya.

---

### **1. User**

**User** adalah entitas utama dalam aplikasi ini yang mewakili pengguna yang mendaftar dan mengelola transaksi keuangan mereka.

#### **Fields**:
- `userId`: integer, ID unik pengguna (otomatis di-generate)
- `firstName`: string, nama depan pengguna (wajib)
- `lastName`: string, nama belakang pengguna (wajib)
- `email`: string, email pengguna yang unik (wajib)
- `password`: string, kata sandi terenkripsi (wajib)
- `phoneNumber`: string, nomor telepon (opsional)
- `address`: string, alamat lengkap pengguna (opsional)

---

### **2. Transaction**

**Transaction** mencatat semua transaksi yang dilakukan oleh pengguna, baik pemasukan (income) maupun pengeluaran (expense).

#### **Fields**:
- `transactionId`: integer, ID unik transaksi (otomatis di-generate)
- `userId`: integer, ID pengguna yang melakukan transaksi (wajib, foreign key ke **User**)
- `amount`: integer, jumlah uang yang terlibat dalam transaksi (wajib)
- `category`: string, kategori transaksi (misal: "Makanan", "Transportasi") (wajib)
- `type`: string, jenis transaksi (`"income"` atau `"expense"`) (wajib)
- `date`: date, tanggal transaksi (wajib)
- `description`: string, deskripsi transaksi (opsional)

#### **Relasi**:
- **User.hasMany(Transaction)**: Seorang **User** dapat memiliki banyak **Transaction**.
- **Transaction.belongsTo(User)**: Setiap **Transaction** hanya dapat terkait dengan satu **User**.

---

### **3. Budget**

**Budget** menyimpan anggaran yang ditetapkan oleh pengguna untuk kategori tertentu, memungkinkan pengguna untuk mengontrol pengeluaran mereka.

#### **Fields**:
- `budgetId`: integer, ID unik anggaran (otomatis di-generate)
- `userId`: integer, ID pengguna yang memiliki anggaran (wajib, foreign key ke **User**)
- `category`: string, kategori anggaran (misal: "Makanan", "Transportasi") (wajib)
- `amount`: integer, jumlah anggaran yang ditetapkan untuk kategori tersebut (wajib)
- `spent`: integer, jumlah yang telah dibelanjakan dalam kategori tersebut (wajib)

#### **Relasi**:
- **User.hasMany(Budget)**: Seorang **User** dapat memiliki banyak **Budget**.
- **Budget.belongsTo(User)**: Setiap **Budget** hanya dapat terkait dengan satu **User**.

---

### **4. Bill**

**Bill** mencatat tagihan yang harus dibayar oleh pengguna, seperti tagihan listrik, internet, atau cicilan.

#### **Fields**:
- `billId`: integer, ID unik tagihan (otomatis di-generate)
- `userId`: integer, ID pengguna yang memiliki tagihan (wajib, foreign key ke **User**)
- `billName`: string, nama tagihan (misal: "Internet", "Listrik") (wajib)
- `amount`: integer, jumlah tagihan yang harus dibayar (wajib)
- `dueDate`: date, tanggal jatuh tempo tagihan (wajib)
- `category`: string, kategori tagihan (misal: "Utilities", "Cicilan") (wajib)

#### **Relasi**:
- **User.hasMany(Bill)**: Seorang **User** dapat memiliki banyak **Bill**.
- **Bill.belongsTo(User)**: Setiap **Bill** hanya dapat terkait dengan satu **User**.

---

### **5. Report**

**Report** adalah laporan keuangan yang dihasilkan untuk memberikan gambaran tentang pemasukan, pengeluaran, dan saldo pengguna dalam periode tertentu.

#### **Fields**:
- `userId`: integer, ID pengguna yang laporan keuangannya dicatat (wajib, foreign key ke **User**)
- `totalIncome`: integer, total pemasukan dalam periode tertentu (wajib)
- `totalExpenses`: integer, total pengeluaran dalam periode tertentu (wajib)
- `balance`: integer, saldo yang tersedia setelah dikurangi pengeluaran (wajib)
- `categories`: object, rincian pengeluaran menurut kategori (misal: `{"Makanan": 500000, "Transportasi": 200000}`)

#### **Relasi**:
- **User.hasMany(Report)**: Seorang **User** dapat memiliki banyak **Report**.
- **Report.belongsTo(User)**: Setiap **Report** hanya dapat terkait dengan satu **User**.

---

## **Relasi Antar Model**
Berikut adalah relasi antar model yang ada dalam aplikasi **Finance Tracker**:

1. **User** ↔ **Transaction**: 
   - **One-to-Many**: Satu **User** memiliki banyak **Transaction**.
   - Relasi ini memungkinkan pengguna untuk mencatat banyak transaksi (baik pemasukan maupun pengeluaran).

2. **User** ↔ **Budget**:
   - **One-to-Many**: Satu **User** memiliki banyak **Budget** untuk mengelola anggaran kategori tertentu.
   - Relasi ini memungkinkan pengguna menetapkan dan melacak anggaran untuk kategori seperti **Makanan**, **Transportasi**, dll.

3. **User** ↔ **Bill**:
   - **One-to-Many**: Satu **User** memiliki banyak **Bill** (tagihan).
   - Relasi ini memungkinkan pengguna untuk mengelola dan melacak tagihan mereka (misalnya: **Internet**, **Listrik**, dll).

4. **User** ↔ **Report**:
   - **One-to-Many**: Satu **User** memiliki banyak **Report** yang menunjukkan ringkasan keuangan berdasarkan **Transaction** dan **Budget**.
   - Relasi ini memungkinkan pengguna melihat laporan keuangan mereka dalam periode tertentu, menunjukkan pemasukan, pengeluaran, dan saldo mereka.

---

## User model
User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions'
});
User.hasMany(Budget, {
  foreignKey: 'userId',
  as: 'budgets'
});
User.hasMany(Bill, {
  foreignKey: 'userId',
  as: 'bills'
});
User.hasMany(Report, {
  foreignKey: 'userId',
  as: 'reports'
});

## Transaction model
Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
Transaction.belongsTo(Budget, {
  foreignKey: 'budgetId',
  as: 'budget'
});
Transaction.belongsTo(Bill, {
  foreignKey: 'billId',
  as: 'bill'
});
Transaction.belongsTo(Report, {
  foreignKey: 'reportId',
  as: 'report'
});

## Budget model
Budget.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
Budget.hasMany(Transaction, {
  foreignKey: 'budgetId',
  as: 'transactions'
});

## Bill model
Bill.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
Bill.hasMany(Transaction, {
  foreignKey: 'billId',
  as: 'transactions'
});

## Report model
Report.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
Report.hasMany(Transaction, {
  foreignKey: 'reportId',
  as: 'transactions'
});





## 1. Authentication

### 1.1 Register a User

- **Endpoint:** `POST /api/register`
- **Description:** Mendaftar pengguna baru.
- **Request Body:**

  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "password": "strongpassword",
    "phoneNumber": "08123456789",
    "address": "Jl. Contoh No. 123, Jakarta"
  }
  ```

- **Response:**
  ```json
  {
    "message": "Registration successful",
    "userId": "12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com"
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
