import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Password from "./password";
import Profile_init from "./profile";
import Description from "./description";
import ErrorAlert from "../error";

export default function Content({ user,LoadingScene }) {
     const router = useRouter();

     const [ischarged_name, isChargedName] = useState(false);
     const [editName, modifyName] = useState(false);
     const [newUsername, setNewUsername] = useState("");

     const [ischarged_email, isChargedEmail] = useState(false);
     const [editEmail, modifyEmail] = useState(false);
     const [newEmail, setNewEmail] = useState("");

     const [verifyPassword, setVerify] = useState("");
     const [confirmVerify, setConfirm] = useState("");

     const [ischarged_password, isChargedPassword] = useState(false);
     const [editPass, modifyPassword] = useState(false);
     const [newPassword, setNewPassword] = useState("");
     const [confirmPassword, setconfirmPassword] = useState("");
     
     const [ischarged_image, isChargedImage] = useState(false);
     const [newImage, setNewImage] = useState(null);
     const [viewImage, setviewImage] = useState(null);
     const [ischarged_description, isChargedDescription] = useState(false);
     const [newDescription, setNewDescription] = useState("");
     const [error, setError] = useState(false);

     const [isDisabled, setIsDisabled] = useState(true);

     // Block summit boton until consummer change something... //
     const handleFieldChange = () => {
          if (newUsername !== user.username || newEmail !== user.email || newDescription !== user.description || newPassword !== '') {
               setIsDisabled(false);
          } else {
               setIsDisabled(true);
          }
     };

     const [formData, setFormData] = useState({
          image: !ischarged_image ? ischarged_image : newImage,
          password: !ischarged_password ? ischarged_password : newPassword,
          email: !ischarged_email ? ischarged_email : newEmail,
          username: !ischarged_name ? ischarged_name : newUsername,
          description: !ischarged_description ? ischarged_description : newDescription
     })
    
     const [loading,setloading] = useState(true); 

     useEffect(() => {
          (async()=>{
               const res = await fetch(`/api/auth/setting-check?id=${user.id}`, {
                    credentials: "include",
                    method: "GET",
                    headers: {
                         "Cache-Control": "no-cache"
                    }
               });
               if(!res.ok) return console.error("Error checking configuration");
               const data = await res.json();
               setNewEmail(data.email);
               setNewUsername(user.username);
               setNewImage(user.img);
               setviewImage(user.img)
               setNewDescription(data.description);
               setloading(false);
          })()
     }, []);

     const setname = () => {
          if(!editName){
               modifyName(true);
          }
          else if(editName){
               modifyName(false);
          }
     }
     const setmail = () => {
          if(!editEmail){
               modifyEmail(true);
          }
          else if(editEmail){
               modifyEmail(false);
          }
     }
     const setpass = () => {
          if(!editPass){
               modifyPassword(true);
          }
          else if(editPass){
               setNewPassword("")
               modifyPassword(false);
          }
     }
     // Manejo del cambio de username
     const handleUsernameChange = (e) => {
          isChargedName(true);
          setNewUsername(e.target.value);
          handleFieldChange();
     };

     // Manejo del cambio de email
     const handleEmailChange = (e) => {
          isChargedEmail(true);
          setNewEmail(e.target.value);
          handleFieldChange();
     };

     // Manejo del cambio de descripción
     const handleDescriptionChange = (e) => {
          isChargedDescription(true);
          setNewDescription(e.target.value);
          handleFieldChange();
     };
     const handlePasswordChange = (e) => {
          isChargedPassword(true);
          setNewPassword(e.target.value);
          handleFieldChange();
     };
     const handle_confirmPassword = (e) => {
          setconfirmPassword(e.target.value);
     };

     const handleImageUpload = async (event) => {
          isChargedImage(true);
          setNewImage(event.target.files[0]);
          setviewImage(URL.createObjectURL(event.target.files[0]));
          handleFieldChange();
     };

      // Handle to summit setting
     const handleSubmit = async () => {
          event.preventDefault();

          if( verifyPassword === "" || confirmVerify === ""){
               return setError("Verify Password Or Confirm Password can't be empty");
          }
          if( verifyPassword !== confirmVerify){
               return setError('Verify Password And Confirm Password are different');
          }
          

          const formData = new FormData();

          // Si el nombre ha sido modificado
          if (ischarged_name) formData.append('username', newUsername);

          // Si el correo ha sido modificado
          if (ischarged_email) formData.append('email', newEmail);

          // Si la contraseña ha sido modificada
          if (ischarged_password) formData.append('password', newPassword);

          // Si la descripción ha sido modificada
          if (ischarged_description) formData.append('description', newDescription);

          // Si la imagen ha sido modificada
          if (ischarged_image && newImage) {
               formData.append('image', newImage);  // La imagen en sí
          }
          formData.append('security', verifyPassword);

          formData.append('id', user.id);  // El id del usuario para actualizar

          try {
               setloading(true);
               const res = await fetch('/api/user/modify', {
                    method: 'PUT',
                    credentials: "include",
                    headers: {
                         "Cache-Control": "no-cache"
                    },
                    body: formData
               });
               if(!res.ok){
                    setloading(false);
                    const error = await res.json();
                    console.log(error.message);

                    return setError(error.message);
               }
               const data = await res.json();
               console.log(data.message);
               sessionStorage.clear();
               window.location.reload();

          } catch (error) {
               setloading(false);
               setError(error);
          }
     };


     if(loading) return <LoadingScene/>;

     return (
          <div className="setting-content grid grid-cols-1 [grid-template-rows:1fr_1fr_0.7fr] p-4 gap-4 justify-center items-center bg-[rgb(19,16,22)] w-full h-full">
               <Profile_init
                    handleSubmit={handleSubmit}
                    newUsername={newUsername}
                    handleUsernameChange={handleUsernameChange}
                    editName={editName}
                    setname={setname}
                    handleImageUpload={handleImageUpload}
                    newImage={newImage}
                    viewImage={viewImage}
                    newEmail={newEmail}
                    handleEmailChange={handleEmailChange}
                    editEmail={editEmail}
                    setmail={setmail}
               />
               <Password
                    handleSubmit={handleSubmit}
                    verifyPassword={verifyPassword}
                    setVerify={setVerify}
                    confirmVerify={confirmVerify}
                    confirmPassword={confirmPassword}
                    handlePasswordChange={handlePasswordChange}
                    newPassword={newPassword}
                    setpass={setpass}
                    editPass={editPass}
                    handle_confirmPassword={handle_confirmPassword}
                    setConfirm={setConfirm}
               />
               <Description
                    handleDescriptionChange={handleDescriptionChange}
                    newDescription={newDescription}
               />

               {error ? <ErrorAlert error={error} errorState={setError} /> : <></>}

               <section className="cursor-pointer send-setting setting-container flex justify-center items-start w-full h-full bg-[rgb(33,27,37)] p-4 justify-end"
               onClick={handleSubmit}>
                    <div className="send_user-layer bg-[#5f9ea0c4] w-1/2 p-1 flex justify-center">
                         <div className="send_user-content w-full bg-[#1b161e] h-full p-[0.6rem] flex justify-center">
                              <div
                                   id="send_button"
                                   type="submit"
                                   disabled={isDisabled}
                                   className="bg-transparent text-[aliceblue]"
                              >
                              Modify
                              </div>
                         </div>
                    </div>
               </section>
          </div>
     );
}
