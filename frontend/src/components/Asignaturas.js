import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class Asignaturas extends Component {
  state = {
    numBase: 0,
    numPOO: 0,
    numPA: 0,
    numATW: 0,
  };

  componentDidMount() {
    this.fetchNumByGroup('BDD').then(count => {
      this.setState({ numBase: count });
    });

    this.fetchNumByGroup('POO').then(count => {
      this.setState({ numPOO: count });
    });

    this.fetchNumByGroup('PA').then(count => {
      this.setState({ numPA: count });
    });

    this.fetchNumByGroup('APP').then(count => {
      this.setState({ numATW: count });
    });
  }

  fetchNumByGroup(groupName) {
    return fetch(`http://localhost:4000/api/grupos/getNumByGroup/${groupName}`)
      .then(response => response.json())
      .then(data => data.count)
      .catch(error => {
        console.error('Error:', error);
        return 0;
      });
  }

  render() {
    const { numBase, numPOO, numPA, numATW } = this.state;

    const data = [
      {
        nombre: 'Base de Datos',
        descripcion: 'Asignatura que abarca los conceptos de la Base de Datos. Aprenderás a diseñar, implementar y administrar sistemas de almacenamiento de información eficientes y seguros, así como a utilizar lenguajes de consulta para extraer y manipular datos de manera efectiva.',
        alumnos: numBase,
        espacio: '100 gb',
      },
      {
        nombre: 'Programación Orientada al Objeto',
        descripcion: 'Asignatura que abarca los conceptos de la programación orientada al objeto (POO). Aprenderás a diseñar y desarrollar aplicaciones utilizando los principios de encapsulación, herencia y polimorfismo, lo que te permitirá crear código modular, reutilizable y fácil de mantener.',
        alumnos: numPOO,
        espacio: '100 gb',
      },
      {
        nombre: 'Programación Avanzada',
        descripcion: 'Asignatura que abarca los conceptos básicos de programación. Explorarás temas avanzados como estructuras de datos complejas, algoritmos de optimización, programación concurrente y paralela, entre otros. A través de desafiantes proyectos, mejorarás tus habilidades de resolución de problemas y te enfrentarás a situaciones más realistas en el desarrollo de software.',
        alumnos: numPA,
        espacio: '100 gb',
      },
      {
        nombre: 'Aplicaciones y Tecnologías de la Web',
        descripcion: 'Asignatura que abarca los conceptos básicos sobre el desarrollo de aplicaciones web modernas. Aprenderás a utilizar tecnologías como HTML, CSS, JavaScript y frameworks populares para crear interfaces interactivas y dinámicas. También explorarás conceptos de seguridad, rendimiento y accesibilidad para desarrollar aplicaciones web de alta calidad.',
        alumnos: numATW,
        espacio: '100 gb',
      },
    ];
    return (
      <div className="p-5">
        <div className="d-flex justify-content-between align-items-center">
          <h2>ASIGNATURAS</h2>
        </div>

        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th className="text-center align-middle">Nombre</th>
              <th className="text-center align-middle">Descripcion</th>
              <th className="text-center align-middle">Alumnos</th>
              <th className="text-center align-middle">Espacio</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.nombre}>
                <td className="text-center align-middle align-items-center">{row.nombre}</td>
                <td className="text-center align-middle align-items-center">{row.descripcion}</td>
                <td className="text-center align-middle align-items-center">{row.alumnos}</td>
                <td className="text-center align-middle align-items-center">{row.espacio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}