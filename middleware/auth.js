import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    // Just check the header, don't try to read the body
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token verification failed, authorization denied" });
  }
};

export const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user?.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admin only." });
    }
  });
};
