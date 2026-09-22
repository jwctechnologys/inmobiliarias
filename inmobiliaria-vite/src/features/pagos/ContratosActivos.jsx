import React, { useState, useEffect } from "react";
import { getCsrfToken } from '../../utils/csrf';
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config';

function ContratosActivos() {
    const [contratos, setContratos] = useState([]);
    const [contratoOtrosi, setContratoOtrosi] = useState([]);
    const [fechaPago, setFechaPago] = useState(""); // Fecha temporal para registro
    const [editandoContratoId, setEditandoContratoId] = useState(null); // Para identificar el contrato en edición
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    const verDetalles = (id) => {
        navigate(`/contratos/${id}`);
    };
    const editarOtroSi = (id) => {
        navigate(`/OtroSiVivienda/${id}`);
    };
    const impresionOtroSi = (id) => {
        navigate(`/OtroSiViviendaImprimir/${id}`);
    };


    useEffect(() => {
        fetch(`${API_URL}/api/contratos/activos/`)
            .then((response) => response.json())
            .then((data) => {
                setContratos(data);
                console.log("Contratos activos:", data);

            })
            .catch((error) => console.error("Error al cargar contratos:", error));
        fetch(`${API_URL}/api/otroSi/`)
            .then((response) => response.json())
            .then((data) => {
                const filteredContratoOtrosi = data.filter(
                    (otroSi) =>
                        otroSi.aceptaOtroSi === false ||
                        otroSi.aceptaOtroSiArrendatario === false
                    );
                setContratoOtrosi(filteredContratoOtrosi);
                console.log("Contratos otroSi:", data);

            })
            .catch((error) => console.error("Error al cargar contratos:", error));
    }, []);


    const generarOtroSi = async (contratoId, fechaFinContrato) => {
        const fechaInicio = new Date(fechaFinContrato);
        const fechaInicios = new Date(fechaFinContrato);
        fechaInicio.setDate(fechaInicio.getDate() + 1); // +1 día
        const fechaFin = new Date(fechaInicios);
        fechaFin.setMonth(fechaFin.getMonth() + 6); // +6 meses

        try {
            const response = await fetch(`${API_URL}/api/otroSi/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({
                    contrato: contratoId,
                    fechainicio: fechaInicio.toISOString().split("T")[0], // Formatear fecha como YYYY-MM-DD
                    fechafin: fechaFin.toISOString().split("T")[0],
                }),
            });

            if (response.ok) {
                try {
                    const response = await fetch(`${API_URL}/api/contratos/${contratoId}/update/`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ otrosiGenerado: true }),
                    });

                    if (response.ok) {
                        // Actualizar estado local
                        alert('El contrato OtroSi Generado.');
                        window.location.reload();
                    } else {
                        console.error('Error al eliminar el contrato.');
                    }
                } catch (error) {
                    console.error('Error al conectar con el servidor:', error);
                }
                console.log(`Contrato otroSi generado para contrato ${contratoId}`);

            } else {
                const errorData = await response.json();
                console.error("Error al generar contrato otroSi:", errorData);
            }
        } catch (error) {
            console.error("Error al generar contrato otroSi:", error);
        }

    };



    const registrarFechaPago = async (id, fechadeMesaPagar) => {
        if (!fechaPago) {
            alert("Por favor selecciona una fecha de pago.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/contratos/${id}/fecha-pago/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'X-CSRFToken': csrfToken,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        contrato_id: id,
                        fecha_pago: fechaPago,
                        fechadeMesaPagar: fechadeMesaPagar,
                    }),
                }
            );

            if (response.ok) {
                alert("Fecha de pago registrada correctamente.");
                setFechaPago("");
                setEditandoContratoId(null); // Salir del modo de edición

                // Actualizar el contrato en el estado sin hacer un fetch adicional
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error("Error al registrar la fecha de pago:", errorData);
                alert("Error al registrar la fecha de pago.");
            }
        } catch (error) {
            console.error("Error al registrar la fecha de pago:", error);
        }
    };
    const eliminarContrato = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/contratos/${id}/update/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contrato_Activo: false }),
            });

            if (response.ok) {
                // Actualizar estado local
                alert('El contrato ha sido eliminado.');
                window.location.reload();
            } else {
                console.error('Error al eliminar el contrato.');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };

    const cancelarEdicion = () => {
        setFechaPago("");
        setEditandoContratoId(null);
    };

    return (
        <table className="contratos-tabla">
            <thead>
                <tr>
                    <th>Contrato ID</th>
                    <th>Nombres Arrendatario</th>
                    <th>Día de Pago Mes Actual</th>
                    <th>Fecha en que Pagó Mes Actual</th>
                    <th>Referencia en Días</th> {/* Nueva columna */}
                    <th>Fecha Fin de Contrato</th>
                    <th>Acciones</th>
                    <th>Estado del Contrato</th>
                </tr>
            </thead>
            <tbody>
                {contratos.map((contrato) => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, "0");
                    const day = String(contrato.diaFinPago).padStart(2, "0");
                    const fechadeMesaPagar = `${year}-${month}-${day}`;

                    // Buscar la fecha de pago registrada
                    const fechaPago = contrato.fechas_pago.find((fecha) => fecha.fechadeMesaPagar === fechadeMesaPagar)?.fecha_pago;

                    // Convertir la fecha de pago y la fecha de pago del mes en objetos Date
                    const fechaDePagoDate = fechaPago ? new Date(fechaPago) : null;
                    const fechaDeMesaPagarDate = new Date(fechadeMesaPagar);

                    // Calcular la diferencia en días
                    let referenciaEnDias = null;
                    if (fechaDePagoDate) {
                        const diffTime = fechaDePagoDate - fechaDeMesaPagarDate;
                        const diferenciaDias = Math.ceil(diffTime / (1000 * 3600 * 24)); // Diferencia en días
                        referenciaEnDias = diferenciaDias < 0
                            ? `Pago adelantado (${Math.abs(diferenciaDias)}) dias`
                            : `Pago retrasado (${Math.abs(diferenciaDias)}) dias`;
                    } else {
                        const today = new Date(); // Fecha actual con hora
                        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const fechaDeMesaPagarDate = new Date(fechadeMesaPagar); // `fechadeMesaPagar` debe ser en formato 'YYYY-MM-DD'
                        const fechaDeMesaPagarDateNormalized = new Date(fechaDeMesaPagarDate.getFullYear(), fechaDeMesaPagarDate.getMonth(), fechaDeMesaPagarDate.getDate());
                        const diffTime = todayDate - fechaDeMesaPagarDateNormalized;
                        const diferenciaDias = Math.ceil((diffTime / (1000 * 3600 * 24)) - 1); // Convertir la diferencia en días
                        referenciaEnDias = diferenciaDias < 0
                            ? `adelantado (${Math.abs(diferenciaDias)}) días`
                            : `retrasado (${Math.abs(diferenciaDias)}) días`;
                    }
                    
                    const contratoOtroSi = contratoOtrosi.find((otrosi) => otrosi.contrato === contrato.id) || {}; // Aquí te aseguras de que existe un contratoOtrosi asociado
                    // Verificar si el botón de "Crear Otrosí" debe mostrarse
                    const mostrarCrearOtrosi =
                        contrato.contrato_Activo &&
                        !contrato.otrosiGenerado &&
                        new Date(contrato.fechafinOtrosi) <= new Date(new Date("2025-03-01").getTime() + 14 * 24 * 60 * 60 * 1000);


                    // Determinar el estado del contrato
                    const estadoContrato =
                        contrato.numOtrosi === 0
                            ? "Contrato original"
                            : `OtroSí ${contrato.numOtrosi}`;
                    return (
                        <tr key={contrato.id}>
                            <td>{contrato.id}</td>
                            <td>{contrato.nombres_arrendatario}</td>
                            <td>{fechadeMesaPagar}</td>
                            <td>
                                {editandoContratoId === contrato.id ? (
                                    <>
                                        {contrato.fechas_pago.some((fecha) => fecha.fechadeMesaPagar === fechadeMesaPagar) ? (
                                            <span>
                                                {
                                                    contrato.fechas_pago.find((fecha) => fecha.fechadeMesaPagar === fechadeMesaPagar)?.fecha_pago
                                                }
                                            </span>
                                        ) : (
                                            <>
                                                <input
                                                    type="date"
                                                    value={fechaPago}
                                                    onChange={(e) => setFechaPago(e.target.value)}
                                                />
                                                <button onClick={() => registrarFechaPago(contrato.id, fechadeMesaPagar)}>
                                                    Guardar
                                                </button>
                                                <button onClick={cancelarEdicion}>Cancelar</button>
                                            </>
                                        )}
                                    </>
                                ) : contrato.fechas_pago.some((fecha) => fecha.fechadeMesaPagar === fechadeMesaPagar) ? (
                                    <span>
                                        {
                                            contrato.fechas_pago.find((fecha) => fecha.fechadeMesaPagar === fechadeMesaPagar)?.fecha_pago
                                        }
                                    </span>
                                ) : (
                                    <button onClick={() => setEditandoContratoId(contrato.id)}>
                                        Registrar Fecha
                                    </button>
                                )}
                            </td>

                            {/* Nueva columna para la referencia en días */}
                            <td>{referenciaEnDias}</td>

                            <td>{contrato.fechafinOtrosi}</td>
                            <td>
                                <button onClick={() => verDetalles(contrato.id)}>Ver Más</button>
                                <button onClick={() => eliminarContrato(contrato.id)}>Eliminar</button>
                            </td>
                            <td>
                            {mostrarCrearOtrosi ? (
                            <button onClick={() => generarOtroSi(contrato.id, contrato.fechafinOtrosi)}>Crear Otrosí</button>
                        ) : (
                            (!contratoOtroSi.aceptaOtroSi || !contratoOtroSi.aceptaOtroSiArrendatario) &&
                            contrato.otrosiGenerado &&
                            contratoOtroSi.vistaImpresion ? (
                                <button onClick={() => impresionOtroSi(contrato.id)}>O.Si {contrato.numOtrosi+1} impresion</button>
                            ) : (
                                (!contratoOtroSi.aceptaOtroSi || !contratoOtroSi.aceptaOtroSiArrendatario) &&
                                    contrato.otrosiGenerado ? (
                                    <button onClick={() => editarOtroSi(contrato.id)}>
                                        O.Si {contrato.numOtrosi+1} Editar 
                                    </button>
                                ) : (
                                    <span>{estadoContrato}</span>
                                )
                            )
                        )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>


    );
}

export default ContratosActivos;
