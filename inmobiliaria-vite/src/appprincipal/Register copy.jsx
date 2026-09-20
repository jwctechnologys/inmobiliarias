// Register.js
import React, { useState, useEffect } from 'react';
import { getCsrfToken } from './csrf';
import { Link,  useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [group, setGroup] = useState('');
    const [tipo_documento, setTipo_documento] = useState('');  
    const [doc_identificacion, setDoc_identificacion] = useState('');    
    const [lugarExpCedula, setLugarExpCedula] = useState('');
    const [direccion, setDireccion] = useState('');
    const [barrio, setBarrio] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [celular, setCelular] = useState('');
    const [celularDos, setCelularDos] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    const handleRegister = async (e) => {
        
        e.preventDefault();
        
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                username,
                first_name,
                last_name,
                email,
                password,
                group,
                tipo_documento,
                doc_identificacion,
                lugarExpCedula,
                direccion,
                barrio,
                ciudad,
                celular,
                celularDos,
            }),
            credentials: 'include',
        });

        const data = await response.json();
        console.log('Response:', response);
        console.log('Data:', data); 
        if (response.ok) {
            alert('User created successfully');
            navigate('/');
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    const groupOptions = [
        'administrador',
        'propietario',
        'arrendatario',
        'proveedor'
    ];
    const groupTipoDocumento = [
        ['CC', 'Cedula'],
        ['CE', 'Cedula extranjeria'],
        ['RC', 'Registro civil'],
        ['TI', 'Tarjeta de identidad'],
        ['DNI', 'Documento de identificacion nacional']
    ];

    return (
        <>
        <Link to="/">Ir a Home</Link>
        <form onSubmit={handleRegister}>
            <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
            >
                <option value="">Seleccione un grupo</option>
                {groupOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>            
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="First Name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Last Name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
<select
    value={tipo_documento}
    onChange={(e) => setTipo_documento(e.target.value)}
    required
>
    <option value="">Seleccione tipo de documento</option>
    {groupTipoDocumento.map((option) => (
        <option key={option[0]} value={option[0]}>
            {option[1]}
        </option>
    ))}
</select>
            <input
                type="text"
                placeholder="Numero del documento"
                value={doc_identificacion}
                onChange={(e) => setDoc_identificacion(e.target.value)}
                required
            />    
            <input
                type="text"
                placeholder="Lugar de expedicion cedula"
                value={lugarExpCedula}
                onChange={(e) => setLugarExpCedula(e.target.value)}
                required
            />         
            <input
                type="text"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
            /> 
            <input
                type="text"
                placeholder="Barrio"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                required
            /> 
            <input
                type="text"
                placeholder="Ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
            /> 
            <input
                type="text"
                placeholder="Celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                required
            /> 
            <input
                type="text"
                placeholder="Otro celular"
                value={celularDos}
                onChange={(e) => setCelularDos(e.target.value)}
                
            />             
            <input

                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />


            <button type="submit">Register</button>
        </form>
        </>
    );
};

export default Register;
