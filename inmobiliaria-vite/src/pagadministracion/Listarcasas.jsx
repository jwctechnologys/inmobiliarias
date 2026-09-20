import React, { useState, useEffect } from 'react';
import Fotocasa from '../appprincipal/estudio/Fotocasa';


async function Cargarcasas() {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/inicio/`);
    const casas = await response.json();
    return casas;
}

function Listarcasas() {
    const [casas, setCasas] = useState([]);
    const [casaSeleccionada, setCasaSeleccionada] = useState(null);
    useEffect(() => {
        const obtenerCasas = async () => {
            try {
                const casasData = await Cargarcasas();
                setCasas(casasData);
            } catch (error) {
                console.error('Error al cargar las casas:', error);
            }
        };

        obtenerCasas();
    }, []);
    const handleCasaSeleccionada = (id) => {
        setCasaSeleccionada(id);
    };
    if (casaSeleccionada !== null) {
        return <Fotocasa casaSeleccionada={casaSeleccionada} />;
    }  
    return (
        <div>

            {casas.map(casa => (
                <><article className="post" >

                    <div className="casa-container" key={casa.id}>
                        <a href="#" className="image featured" onClick={() => handleCasaSeleccionada(casa.id)}><img src={casa.fotoPrincipal} alt="Foto Principal" />
                        </a>
                        <div className="text-overlay">
                            <p>Dirección: {casa.direccion}</p>
                            <p>Canon Mensual: {casa.canonmensual}</p>
                            <p>Descripción: {casa.descripcion}</p>
                        </div>
                    </div>

                </article>

                </>
            ))}
        </div>
    );
}

export default Listarcasas;