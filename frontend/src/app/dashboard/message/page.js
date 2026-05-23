"use client";

import Message from "../../components/options/messages/message";
import UseMain from "../../components/main_options";

export default function Chat_content(){

     // ===============|| send the component of the rute to the main content ||================ //

     return <UseMain Main_content={Message}/>;
}