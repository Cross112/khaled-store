const postgres = require('postgres');

// === التعديل هنا ===
// بدل ما نقرأ DATABASE_URL هنقرأ الاسم اللي Netlify عمله
const {DATABASE_URL} = process.env; 

// إعداد الاتصال
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
});

exports.handler = async (event, context) => {
  // تفعيل CORS عشان المتصفح يقبل الداتا
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET'
  };

  try {
    const products = await sql`SELECT * FROM products`;

    const formattedProducts = products.map(p => ({
        id: p.id,
        title: p.title,
        price: parseFloat(p.price),
        mainImage: p.image,
        colors: p.colors.map(c => ({ 
            name: c === 'white' ? 'أبيض' : c === 'black' ? 'أسود' : 'رمادي',
            value: c,
            images: [
                `images/${p.category}/${c}/1.webp`,
                `images/${p.category}/${c}/2.webp`,
                `images/${p.category}/${c}/3.webp`
            ]
        })),
        sizes: p.sizes
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedProducts),
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch products' }),
    };
  }
};
