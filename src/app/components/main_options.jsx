import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSession from "./check_session";

// scripts
import { handleLogout } from "../scripts/logout";
import { createSocket } from '../scripts/socket';

import Top_bar from "../components/home/nav-bar/top_bar";
import Foot from "../components/home/nav-bar/foot";
import Table from "../components/options/table";
import { LoadingScreen, LoadingScene } from "../components/loader/main";

export default function UseMain({Main_content}){

    // ===============|| Look for the info user ||================ //

    const {loggedIn, user, loading} = useSession();
    const [loading_socket, loadsockect] = useState(true);
    const [newSocket, setSocket] = useState(null);

    const [unread_notification, set_notifications] = useState(0);
    const [unread_value, set_count] = useState(0);
    const redirect = useRouter();


    useEffect(() => {
        if (loggedIn === false && !loading) {
            redirect.push("/login");
            return
        }
    }, [loggedIn,loading]);
    
    useEffect(() => {
        if (user && user.id && window.location.pathname === "/dashboard") {
            redirect.push(`/dashboard/profile?id=${user.id}`);
        }
    }, [user]);


    useEffect(()=>{
        if(!loggedIn) return
        fetch(`/api/chat/unread?id=${user.id}`, { credentials: "include" })
            .then(r => r.json())
            .then(data => {
                set_count(data.unread);
                set_notifications(data.notice);
            })   
            .catch((err)=>{
                console.log(err);
            })
            .finally(()=>{
                loadsockect(false);
            });
    },[loggedIn,user])

    useEffect(() => {
        if ( loading_socket || !loggedIn || !user) return;
        const newSocket = createSocket(user.id);
        console.log('creating dude', newSocket);
        setSocket(newSocket);
        

        newSocket.on("connect", () => {
            console.log(`✅ User ${user.id} connected via socket`);
        });
        
        newSocket.on("unread_check", (unread_count) => {
            set_count(unread__ => {
                const new_value = unread__ + unread_count.unread;
                console.log('Nuevo valor calculado:', new_value);
                return new_value;
            });
        });
        newSocket.on("notification", (notice) => {
            set_notifications(notice__ => {
                const new_value = notice__ + notice.quantity;
                console.log('Nuevo valor notificacion:', new_value);
                return new_value;
            });
        });
        return () => {
            newSocket.disconnect();
        };
    }, [ loading_socket, loggedIn, user]);

    // if (loading || !newSocket) {
    //     return <>
    //             {/* <Top_bar unread_count={unread_value} unread_notification={unread_notification} handlelogout={handleLogout} loggedIn={loggedIn} user={loggedIn ? user : {}}/> */}
    //             <LoadingScreen/>
    //             {<Foot/> ? <Foot/> : <div>Cargando...</div>}
    //         </>;
    // }

    return (
        <>
            <Top_bar
                unread_count={unread_value}
                unread_notification={unread_notification}
                handlelogout={handleLogout}
                loggedIn={loggedIn}
                user={user}
            />
            <main className="mt-[4.5rem] grid grid-cols-[0.3fr_1fr] gap-4 justify-center w-full box-border min-h-[90.3vh] p-2 bg-black max-sm:grid-cols-1">
                <Table
                        handlelogout={handleLogout}
                        messages={unread_value}
                        notification_value={unread_notification}
                />
                <section className="max-sm:py-10">
                    <div className="h-full w-full flex flex-col justify-center items-center box-border rounded p-[0.8rem] max-sm:p-[0.1rem] gap-[0.86rem] bg-[#050505] ">
                        <Main_content
                            LoadingScene={LoadingScene}
                            user={user}
                            newSocket={newSocket}
                            loading_socket={loading_socket}
                            loading={loading}
                            unread_value={unread_value}
                            unread_notification={unread_notification}
                            loggedIn={loggedIn}
                        />
                    </div>
                </section>
            </main>
            <>
                {<Foot /> ? <Foot /> : <div>Cargando...</div>}
            </>
        </>
    )
}