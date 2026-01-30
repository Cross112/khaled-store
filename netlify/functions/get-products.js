const postgres = require('postgres');

// قراءة المتغير
const { DATABASE_URL } = process.env;

// إعداد الاتصال
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
});

exports.handler = async (event, context) => {
  // 1. أهم جزء: إعدادات منع الكاش (عشان يجيب الجديد دايماً)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // ممنوع التخزين
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // طباعة رسالة في اللوج عشان نتأكد إن الاتصال بدأ
    console.log("🚀 Starting DB Connection...");
    
    // جلب المنتجات
    const products = await sql`SELECT * FROM products`;
    
    // طباعة عدد المنتجات اللي السيرفر شايفها
    console.log(`✅ Success! Found ${products.length} products.`);

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
      headers, // بنبعت الهيدرز اللي بتمنع الكاش
      body: JSON.stringify(formattedProducts),
    };
  } catch (error) {
    console.error('❌ Database Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch products', details: error.message }),
    };
  }
};
