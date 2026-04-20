"use client";

import Help from "../components/help/main";
import Top_bar from "../components/home/nav-bar/top_bar"; 
import Foot from "../components/home/nav-bar/foot";
import useSession from "../components/check_session";

import { handleLogout } from "../scripts/logout";
import { LoadingScreen } from "../components/loader/main";

// main style css //

import './styles/main.css';

export default function Helpme(){ 
     const {loggedIn, user, loading} = useSession();

     if(loading)    return <>
                         <Top_bar handlelogout={handleLogout} loggedIn={loggedIn} user={loggedIn ? user : {}}/>
                         <LoadingScreen/>
                         {<Foot/> ? <Foot/> : <div>Loading...</div>}
                    </>;
     return (
          <>   
                    <Top_bar handlelogout={handleLogout} loggedIn={loggedIn} user={loggedIn ? user : {}}/>
                    <main className="main-content">
                         <Help/>
                    </main>
                    <Foot className="main-footer"/>

          </>
     )
}