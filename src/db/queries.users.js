const User = require("./models").User;
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');

module.exports = {

  createUser(newUser, callback){
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);
    return User.create({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: newUser.email,
        from: 'info@blocipedia.com',
        subject: 'Welcome to blocipedia',
        text: 'Thank you for signing up - start sharing your knowledge with other members in the community!',
        html: '<strong>Let the fun begin!</strong>',
      };
      //console.log(msg); too see if the msg object looks good in the terminal
      sgMail.send(msg);
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  }

}
