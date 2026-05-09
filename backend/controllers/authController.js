exports.register = (req, res) => {

   const user = req.body;

   res.json({
      message: "User registered successfully",
      user
   });

};

exports.login = (req, res) => {

   const { email, password } = req.body;

   res.json({
      message: "Login successful",
      email
   });

};