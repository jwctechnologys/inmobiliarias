// Register.js
import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    // Agrupamos los links por categoría para mejor organización
    const registrationLinks = [
        {
            title: "Registrar Usuarios",
            links: [
                { to: "/register/Arrendador", text: "Registrar Arrendador", icon: "🏠", color: "bg-blue-500" },
                { to: "/register/Propietario", text: "Registrar Propietario", icon: "🏢", color: "bg-green-500" },
                { to: "/register/Arrendatario", text: "Registrar Arrendatario", icon: "👤", color: "bg-purple-500" },
            ]
        },
        {
            title: "Calificaciones",
            links: [
                { to: "/ver-calificaciones-arrendatario", text: "Ver calificaciones de arrendatario", icon: "⭐", color: "bg-yellow-500" },
                { to: "/calificar-arrendatarios", text: "Calificar arrendatarios", icon: "📝", color: "bg-orange-500" },
                { to: "/ver-calificaciones-proveedores", text: "Ver calificaciones de proveedores", icon: "⭐", color: "bg-yellow-600" },
                { to: "/calificar-proveedores", text: "Calificar proveedores", icon: "📝", color: "bg-orange-600" },
            ]
        },
        {
            title: "Consultas",
            links: [
                { to: "/VerUsuarios", text: "Ver Usuarios Registrados", icon: "👥", color: "bg-indigo-500" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Panel de Registro y Calificaciones
                    </h1>
                    <p className="text-xl text-gray-600">
                        Gestiona usuarios y calificaciones del sistema
                    </p>
                </div>

                {/* Grid de categorías */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {registrationLinks.map((category, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                        >
                            {/* Cabecera de categoría */}
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white">
                                    {category.title}
                                </h2>
                            </div>

                            {/* Lista de links */}
                            <div className="p-6 space-y-3">
                                {category.links.map((link, linkIdx) => (
                                    <Link
                                        key={linkIdx}
                                        to={link.to}
                                        className="group block"
                                    >
                                        <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border-2 border-transparent hover:border-gray-300">
                                            {/* Icono */}
                                            <div className={`${link.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                                                {link.icon}
                                            </div>
                                            
                                            {/* Texto */}
                                            <div className="ml-4 flex-1">
                                                <p className="text-gray-900 font-medium group-hover:text-gray-700">
                                                    {link.text}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Click para acceder
                                                </p>
                                            </div>

                                            {/* Flecha */}
                                            <div className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200">
                                                →
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        Selecciona una opción para continuar
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;