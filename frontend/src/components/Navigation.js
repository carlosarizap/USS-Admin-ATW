import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import logoUSS from '../images/logoUSS.png'

export default class Navigation extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg">
                <div className='container'>

                    <Link className='navbar-brand' to="/">
                        <img src={logoUSS} alt="Example" style={{ width: '200px', height: 'auto' }} />
                    </Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                        <li className="nav-item active">
                                <Link className='nav-link fw-bold' to="/menu">Inicio</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/alumnos">Alumnos</Link>
                            </li>
                            <li className="nav-item fw-bold">
                                <Link className='nav-link' to="/asignaturas">Asignaturas</Link>
                            </li>
                            <li className="nav-item fw-bold">
                                <Link className='nav-link' to="/operadores">Operadores</Link>
                            </li>
                            <li className="nav-item fw-bold">
                                <Link className='nav-link' to="/reportes">Reportes</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}
