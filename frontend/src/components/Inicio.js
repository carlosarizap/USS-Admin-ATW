import React, { Component } from 'react';

export default class Inicio extends Component {
  state = {
    numAlumnos: 0,
    numOperadores: 0,
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
    this.fetchNumByGroup('Alumnos').then(count => {
      this.setState({ numAlumnos: count });
    });
    this.fetchNumByGroup('Operadores').then(count => {
      this.setState({ numOperadores: count });
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
    const { numAlumnos, numOperadores, numBase, numPOO, numPA, numATW } = this.state;

    return (
      <div>
        <div className="d-flex justify-content-center">
          <div className="square" style={{ backgroundColor: '#6891d9', border: '5px solid #405882' }}>
            <h3 style={{ marginBottom: '40px', marginTop: '10px' }}>Total Alumnos:</h3>
            <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>{numAlumnos}</h2>
          </div>
          <div className="square" style={{ backgroundColor: '#c979c8', border: '5px solid #823981' }}>
            <h3 style={{ marginBottom: '40px', marginTop: '10px' }}>Total Operadores:</h3>
            <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>{numOperadores}</h2>
          </div>
          <div className="square" style={{ backgroundColor: '#79c985', border: '5px solid #417849' }}>
            <h3 style={{ marginBottom: '40px', marginTop: '10px' }}>Total Asignaturas:</h3>
            <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>4</h2>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <div className="square" style={{ backgroundColor: '#e6a95e', border: '5px solid #ad7a3b' }}>
            <h3 style={{ marginBottom: '30px', marginTop: '10px', textAlign: 'center', fontSize: '25px' }}>Total Alumnos en Base de Datos:</h3>
            <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>{numBase}</h2>
          </div>
          <div className="square" style={{ backgroundColor: '#e6d55a', border: '5px solid #b5a20e' }}>
            <h3 style={{ marginBottom: '30px', marginTop: '10px', textAlign: 'center', fontSize: '25px' }}>Total Alumnos en Prog. OO:</h3>
            <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>{numPOO}</h2>
          </div>
          <div className="square" style={{ backgroundColor: '#d96459', border: '5px solid #ad382d' }}>
            <h3 style={{ marginBottom: '30px', marginTop: '10px', textAlign: 'center', fontSize: '25px' }}>Total Alumnos en Prog. Avanzada:</h3>
            <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>{numPA}</h2>
          </div>
          <div className="square" style={{ backgroundColor: '#53d4c7', border: '5px solid #318585' }}>
            <h3 style={{ marginBottom: '30px', marginTop: '10px', textAlign: 'center', fontSize: '25px' }}>Total Alumnos en App. y Tec. Web:</h3>
            <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>{numATW}</h2>
          </div>
        </div>
      </div>
    );
  }
}
