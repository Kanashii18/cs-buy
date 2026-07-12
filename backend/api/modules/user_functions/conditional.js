const conditional = {
     email_conditional: (email) => {
          let valid_email = /^[A-Za-z0-9._%+-]+@[A-Za-z]{1,6}\.[A-Za-z]{1,3}$/;
          valid_email = valid_email.test(email);
          
          let valid_range = /^[A-Za-z0-9._%+-]{8,}@/;
          valid_range = valid_range.test(email);

          if (!valid_email) {
               return "Your email have a invalid structure. example@gmail.com";
          }
          if (!valid_range) {
               return "Your email must have at least 8 characters before '@'.";
          }
          if (email.length > 55){
               return "Your email cannot have more than 55 characters.";
          }
     },
     password_conditional: (password) => {
          if(password.length < 6 || password.length > 30){
               return 'Your password must be between 6 and 30 characters.';
          }
     },
     username_conditional: (username) => {
          if(username.length >= 16){
               return 'Your username cannot have more than 16 characters.';
          }
     },
     description_conditional: (description) => {
          if(description.length >= 130){
               return 'Your description cannot have more than y characters.';
          }
     }
};
export default conditional;