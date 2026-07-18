const conditional = {
     email_conditional: (email : string) => {
          const valid_email = /^[A-Za-z0-9._%+-]+@[A-Za-z]{1,6}\.[A-Za-z]{1,3}$/;
          const is_valid_email = valid_email.test(email);
          
          const valid_range = /^[A-Za-z0-9._%+-]{8,}@/;
          const is_valid_range = valid_range.test(email);

          if (!is_valid_email) {
               return { ok:false, error:"Your email have a invalid structure. example@gmail.com"};
          }
          if (!is_valid_range) {
               return { ok:false, error:"Your email must have at least 8 characters before '@'."};
          }
          if (email.length > 100){
               return { ok:false, error:"Your email cannot have more than 100 characters."};
          }
     },
     password_conditional: (password : string) => {
          if(password.length < 6 || password.length > 30){
               return { ok: false, error: 'Your password must be between 6 and 30 characters.'};
          }
     },
     username_conditional: (username : string) => {
          if(username.length >= 16){
               return { ok: false, error : 'Your username cannot have more than 16 characters.' };
          }
     },
     description_conditional: (description : string) => {
          if(description.length >= 130){
               return {ok:false, error:'Your description cannot have more than y characters.'};
          }
     }
};
export default conditional;