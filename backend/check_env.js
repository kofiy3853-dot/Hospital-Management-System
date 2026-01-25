require('dotenv').config();
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('ACCESS_TOKEN_EXPIRE:', process.env.ACCESS_TOKEN_EXPIRE);
