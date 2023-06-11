import { Socket } from "socket.io-client"
import { toast } from "react-toastify"
import { useState, useEffect } from "react"

interface Props {
    socket: Socket
    username: string
    room: string
}

interface messageContent {
    room: string
    author: string
    message: string
    time: string
}

const Chats = (props: Props) => {

    const socket = props.socket

    const [currMessage, setCurrMessage] = useState("")
    const [messageArr, setMessageArr] = useState<messageContent[]>([])


    const sendMessage = async () => {
        if (currMessage !== "") {
            // sends a message to socket io server
            const messageData = {
                room: props.room,
                author: props.username,
                message: currMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
            }

            // adds new message to the previous state of the message array
            setMessageArr((arr) => [...arr, messageData])

            // sends a send_message event to socket io server
            await socket.emit("send_message", messageData)

        } else {
            toast.error("Please enter a message")
        }
    }

    // listens for messages in the room the user is in
    useEffect(() => {
        const receiveMessage = (data: messageContent) => {
            // receives message from back end 
            console.log(data);
            // adds new message to the previous state of the message array
            setMessageArr((arr) => [...arr, data])
        };

        // listens for receive_message events from back end
        socket.on("receive_message", receiveMessage);

        // clean up event listener when the component unmounts, running useEffect once
        return () => {
            socket.off("receive_message", receiveMessage)
        };
    }, [socket]);


    return (
        <>
            <h1>{props.username}</h1>
            <h2>Room ID: {props.room}</h2>
            <div className="chat-header">
                <p>Live Chat</p>
            </div>
            <div className="chat-body">
                {messageArr.map((messageContent: messageContent, index: number) => {
                    return <div className="message" 
                                key={index} 
                                id={props.username === messageContent.author 
                                    ? "you" : "other"}> 
                                <div>
                                    <div className="message-content">
                                        <p>{messageContent.message}</p>
                                    </div>
                                    <div className="message-meta">
                                        <p id="time">{messageContent.time}</p>
                                        <p id="author">{messageContent.author}</p>
                                    </div>
                                </div>
                           </div>
                })}
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    placeholder="Send Messages"
                    value={currMessage}
                    onChange={(e) => setCurrMessage(e.target.value)}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </>
    )
}

export default Chats