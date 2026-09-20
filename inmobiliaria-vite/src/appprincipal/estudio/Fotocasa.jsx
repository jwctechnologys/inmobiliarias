import React, { useState, useEffect } from 'react';


async function Cargarcasas() {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/arriendo/`);
    const casas = await response.json();
    return casas;
}

function Fotocasa({ casaSeleccionada }) {
    
    const [casas, setCasas] = useState([]);

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
    
    const casasFiltradas = casaSeleccionada !== null ? casas.filter(casa => casa.arrendar === casaSeleccionada) : casas;
    return (
        <div>

            {casasFiltradas.map(casa => (
                <><article className="post" >

                    <div className="casa-container" key={casa.id}>
                        <a href="#" className="image featured"><img src={casa.imagen} alt="Foto Principal" />
                        </a>
                    </div>

                </article>

                </>
            ))}
        </div>
    );
}

export default Fotocasa;