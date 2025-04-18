import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const con = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

con.connect(err => {
  if (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});


// ——— CRUD Endpoints ———

// 1) GET all invoices
app.get('/inv', (req, res) => {
  const sql = `SELECT * FROM invoices`;
  con.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    const list = results.map(r => ({
      id:          r.id,
      number:      r.number,
      date:        r.invoice_date,
      paymentDue:  r.payment_due,
      buyer: {
        company: r.company,
        country: r.country,
        vat:     r.vat,
        address: r.buyer_address,
        code:    r.buyer_code,
        phone:   r.buyer_phone,
        email:   r.buyer_email
      },
      seller: {
        company: r.seller_name,
        vat:     r.seller_vat,        // if you’ve added this column
        address: r.seller_address,
        code:    r.seller_code,
        phone:   r.seller_phone,
        email:   r.seller_email
      },
      lines:     JSON.parse(r.invoice_lines),
      transport: parseFloat(r.transport)
    }));

    res.json({ status: 'success', list });
  });
});

// 2) POST new invoice
app.post('/inv', (req, res) => {
  const inv = req.body;
  const sql = `
    INSERT INTO invoices
      (
        number,
        invoice_date,
        payment_due,

        company,
        country,
        vat,

        buyer_address,
        buyer_code,
        buyer_phone,
        buyer_email,

        seller_name,
        seller_vat,       -- if using this column
        seller_address,
        seller_code,
        seller_phone,
        seller_email,

        invoice_lines,
        transport
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    inv.number,
    inv.date,
    inv.paymentDue,

    inv.buyer.company,
    inv.buyer.country,
    inv.buyer.vat,

    inv.buyer.address,
    inv.buyer.code,
    inv.buyer.phone,
    inv.buyer.email,

    inv.seller.company,
    inv.seller.vat || null,      // or '' if not using seller_vat
    inv.seller.address,
    inv.seller.code,
    inv.seller.phone,
    inv.seller.email,

    JSON.stringify(inv.lines),
    inv.transport || 0
  ];

  con.query(sql, params, err => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(201).json({ status: 'success' });
  });
});

// 3) PUT (update) by ID
app.put('/inv/:id', (req, res) => {
  const id = req.params.id;
  const inv = req.body;
  const sql = `
    UPDATE invoices SET
      number         = ?,
      invoice_date   = ?,
      payment_due    = ?,

      company        = ?,
      country        = ?,
      vat            = ?,

      buyer_address  = ?,
      buyer_code     = ?,
      buyer_phone    = ?,
      buyer_email    = ?,

      seller_name    = ?,
      seller_vat     = ?,   -- if using this column
      seller_address = ?,
      seller_code    = ?,
      seller_phone   = ?,
      seller_email   = ?,

      invoice_lines  = ?,
      transport      = ?
    WHERE id = ?
  `;
  const params = [
    inv.number,
    inv.date,
    inv.paymentDue,

    inv.buyer.company,
    inv.buyer.country,
    inv.buyer.vat,

    inv.buyer.address,
    inv.buyer.code,
    inv.buyer.phone,
    inv.buyer.email,

    inv.seller.company,
    inv.seller.vat || null,
    inv.seller.address,
    inv.seller.code,
    inv.seller.phone,
    inv.seller.email,

    JSON.stringify(inv.lines),
    inv.transport || 0,

    id
  ];

  con.query(sql, params, err => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ status: 'success' });
  });
});

// 4) DELETE by ID
app.delete('/inv/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM invoices WHERE id = ?`;
  con.query(sql, [id], err => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ status: 'success' });
  });
});


// Start server
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
