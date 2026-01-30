const postgres = require('postgres');
const { DATABASE_URL } = process.env;

const sql = postgres(DATABASE_URL, { ssl: 'require' });

exports.handler = async (event, context) => {
  // إعدادات CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // لو الطلب مجرد فحص (OPTIONS) نرد عليه علطول
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // التأكد إن الطريقة POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    // استقبال البيانات من الموقع
    const data = JSON.parse(event.body);
    const { name, phone, address, details, total } = data;

    // تسجيل الطلب في الداتا بيز
    await sql`
      INSERT INTO orders (customer_name, phone, address, details, total_price)
      VALUES (${name}, ${phone}, ${address}, ${details}, ${total})
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Order saved successfully!" }),
    };

  } catch (error) {
    console.error('Order Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to save order" }),
    };
  }
};