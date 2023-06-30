import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import * as XLSX from 'xlsx';

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/alumnos');
      const data = await response.json();
      setAlumnos(data);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const handleGroupChange = (event) => {
    const selectedGroup = event.target.value;
    setSelectedGroup(selectedGroup);
  };

  const filterAlumnosByGroup = () => {
    //console.log(selectedGroup)
    if (selectedGroup === "Selecciona Asignatura..." || selectedGroup === null) {
      return alumnos;
    }
    return alumnos.filter((alumno) => alumno.Asignaturas.includes(selectedGroup));
  };

  const handleEstadoChange = async (checked, alumnoId) => {
    try {
      // Make the API call to update the alumno's Estado
      await fetch(`http://localhost:4000/api/alumnos/${alumnoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Estado: checked }),
      });

      // Update the local state with the updated alumno
      setAlumnos((prevAlumnos) =>
        prevAlumnos.map((alumno) =>
          alumno._id === alumnoId ? { ...alumno, Estado: checked } : alumno
        )
      );
    } catch (error) {
      console.error('Error updating alumno:', error);
    }
  };

  const formatAsignaturas = (asignaturas) => {
    if (Array.isArray(asignaturas)) {
      return asignaturas.join(',');
    } else if (typeof asignaturas === 'string') {
      return asignaturas;
    } else {
      return '';
    }
  };

  const handleDownloadExcel = () => {
    const formattedAlumnos = alumnos.map((alumno) => ({
      _id: alumno._id,
      Rut: alumno.Rut,
      Password: alumno.Password,
      Nombre: alumno.Nombre,
      Apellidos: alumno.Apellidos,
      Correo: alumno.Correo,
      Estado: alumno.Estado ? true : false,
      Asignaturas: formatAsignaturas(alumno.Asignaturas),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedAlumnos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumnos');
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'alumnos.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
  
      const worksheet = workbook.Sheets['Alumnos'];
      const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      // Get the headers row
      const headers = importedData[0];
  
      // Remove the headers row
      importedData.shift();
  
      // Create an array of objects representing the imported data
      const importedAlumnos = importedData.map((row) => {
        const alumno = {};
        headers.forEach((header, index) => {
          if (header === 'Asignaturas') {
            const asignaturas = row[index];
            alumno[header] = asignaturas.split(',').map((asignatura) => asignatura.trim());
          } else {
            alumno[header] = row[index];
          }
        });
        return alumno;
      });

      console.log(importedAlumnos)
  
      try {
        const response = await fetch('http://localhost:4000/api/alumnos/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(importedAlumnos),
        });
  
        if (response.ok) {
          setAlumnos(importedAlumnos);
          alert('Import successful');
          fetchAlumnos();
        } else {
          alert('Import failed');
        }
      } catch (error) {
        console.error('Error importing alumnos:', error);
        alert('Import failed');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };
  

  const handleRowClickApoderado = (alumnoId) => {
    navigate(`/alumnos/${alumnoId}`);
  };

  return (
    <div className="p-5">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Alumnos</h2>
        <div className="input-buttons-container d-flex align-items-center">
          <div className="d-flex align-items-center">
            <select className='form-select' style={{ width: '300px', marginRight: '12px' }} onChange={handleGroupChange}>
              <option key="Selecciona">
                Selecciona Asignatura...
              </option>
              <option key="Base de Datos" value="BDD">
                Base de Datos
              </option>
              <option key="Programacion_Orientada_al_Objeto" value="POO">
                Programacion Orientada al Objeto
              </option>
              <option key="Programacion_Avanzada" value="PA">
                Programación Avanzada
              </option>
              <option key="Aplicaciones_y_Tecnologias_Web" value="APP">
                Aplicaciones y Tecnologias de la Web
              </option>
            </select>
            <div className="input-container">
              <input type="file" style={{ width: '180px' }} onChange={handleImportExcel} className="form-control" accept=".xlsx" />
            </div>
            <button className="btn btn-excel" onClick={handleDownloadExcel}>DESCARGAR EXCEL</button>
            <Link to="/alumnos/crear" className="btn btn-primary">
              CREAR ALUMNO
            </Link>
          </div>
        </div>
      </div>

      {alumnos && alumnos.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Rut</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Correo</th>
              <th>Asignaturas</th>

              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filterAlumnosByGroup().map((alumno) => (
              <tr key={alumno._id} onDoubleClick={() => handleRowClickApoderado(alumno._id)}>
                <td>{alumno.Rut}</td>
                <td>{alumno.Nombre}</td>
                <td>{alumno.Apellidos}</td>
                <td>{alumno.Correo}</td>
                <td>{formatAsignaturas(alumno.Asignaturas)}</td>


                <td>
                  <Switch
                    checked={alumno.Estado}
                    onChange={(checked) => handleEstadoChange(checked, alumno._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay alumnos en esta asignatura.</p>
      )}
    </div>
  );
};

export default Alumnos;