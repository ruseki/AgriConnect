/* adminMiddleware.js */

const adminMiddleware = (req, res, next) => {
  const user = req.user;

  if (!user || !user.isAdmin) {
    console.log('Access denied: User is not an admin.'); 
    return res.status(403).json({ redirect: '/', message: 'Access denied. Admins only.' });
  }

  next(); 
};

export default adminMiddleware;