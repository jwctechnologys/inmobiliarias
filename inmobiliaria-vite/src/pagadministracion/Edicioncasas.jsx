import { useState } from "react";


function Edicioncasas() {
    const [user, setUser] = useState('')
    const [direccion, setDireccion] = useState('')
    const [estado, setEstado] = useState('')
    const [propietario, setPropietario] = useState('')


    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/inicio/`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({ user, direccion, estado, propietario }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await res.json()
        console.log(data)
    };

    return (
        <form onSubmit={handleSubmit} className="col-6 mx-auto card p-3 shadow-lg" encType="multipart/form-data">

            <h2>Agregar casa</h2>
            <hr />
            <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Usuario</label>
                <input type="text" className="form-control" id="exampleInputPassword1" onChange={e => setUser(e.target.value)} />

            </div>
            <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Dirección</label>
                <input required type="text" className="form-control" id="exampleInputPassword1" onChange={e => setDireccion(e.target.value)} />


            </div>
            <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Estado</label>
                <input required type="text" className="form-control" id="exampleInputPassword1" onChange={e => setEstado(e.target.value)} />
            </div>
            <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Propietario</label>
                <input required type="text" className="form-control" id="exampleInputPassword1" onChange={e => setPropietario(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-success">Agregar esta casa</button>
        </form>
    )
}
export default Edicioncasas;