import React, { useState } from "react";
import Encabezadodos from "./encabezadodos";


const BotonRs = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>



            <div className={`nav_items ${isOpen && "open"}`}>

                <Encabezadodos />
            </div>
            <div className={`nav_toggle ${isOpen && "open"}`} onClick={() => setIsOpen(!isOpen)} >
                <nav className="main">
                    <ul>
                        <li className="menu">
                            <a className="fa-bars" href="#menu">Menu</a>
                        </li>
                    </ul>
                </nav>
            </div>


        </>
    )
}
export default BotonRs