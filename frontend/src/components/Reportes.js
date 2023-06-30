import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = ['#62de57', '#ff5959'];
const COLORSBAR = ['#e6d55a', '#c979c8','#e6a95e','#53d4c7'];

const Reportes = () => {
  const [alumnos, setAlumnos] = useState([]);
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

  const handleDownloadExcel = () => {
    const formattedAlumnos = alumnos.map((alumno) => ({
      _id: alumno._id,
      Rut: alumno.Rut,
      Nombre: alumno.Nombre,
      Apellidos: alumno.Apellidos,
      UltimaConexion: new Date(alumno.UltimaConexion).toLocaleString('es-ES'),
      FechaCreacion: new Date(alumno.FechaCreacion).toLocaleString('es-ES'),
      Estado: alumno.Estado ? true : false,
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

  const getEstadoData = () => {
    const trueCount = alumnos.filter((alumno) => alumno.Estado).length;
    const falseCount = alumnos.length - trueCount;

    return [
      { name: 'Activo', value: trueCount },
      { name: 'Inactivo', value: falseCount },
    ];
  };

  const getAsignaturasData = () => {
    const asignaturasMap = new Map();
    alumnos.forEach((alumno) => {
      alumno.Asignaturas.forEach((asignatura) => {
        const count = asignaturasMap.get(asignatura) || 0;
        asignaturasMap.set(asignatura, count + 1);
      });
    });

    const data = Array.from(asignaturasMap).map(([asignatura, count]) => ({
      asignatura,
      count,
    }));

    return data;
  };

  const getUltimaConexionData = () => {
    const dateMap = new Map();
    alumnos.forEach((alumno) => {
      const date = new Date(alumno.UltimaConexion).toLocaleDateString('es-ES');
      const count = dateMap.get(date) || 0;
      dateMap.set(date, count + 1);
    });

    const data = Array.from(dateMap).map(([date, count]) => ({
      date,
      count,
    }));

    return data;
  };

  return (
    <div className="p-5">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Reportes</h2>
        <div className="input-buttons-container d-flex align-items-center">
          <div className="d-flex align-items-center">
            <button className="btn btn-excel" onClick={handleDownloadExcel}>DESCARGAR EXCEL</button>
          </div>
        </div>
      </div>

      {alumnos && alumnos.length > 0 ? (
        <div>
          {alumnos && alumnos.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Rut</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Últ. Conexión</th>
                  <th>Fecha de Creación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno._id}>
                    <td>{alumno.Rut}</td>
                    <td>{alumno.Nombre}</td>
                    <td>{alumno.Apellidos}</td>
                    <td> {new Date(alumno.UltimaConexion).toLocaleString('es-ES')}</td>
                    <td> {new Date(alumno.FechaCreacion).toLocaleString('es-ES')}</td>

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
            <p>No hay alumnos...</p>
          )}

          <div className="row charts-container">
            <div className="col pie-chart-container text-center">
              <h4 className='text-center'>Estado de Alumnos</h4>
              <PieChart width={400} height={300}>
                <Pie
                  data={getEstadoData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {getEstadoData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </div>

            <div className="col bar-chart-container">
            <h4 className='text-center'>Última Conexión de Alumnos</h4>
              <BarChart width={350} height={300} data={getUltimaConexionData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6891d9" />
              </BarChart>
            </div>

            <div className="col pie-chart-container">
            <h4 className='text-center'>Alumnos por Asignatura</h4>
              <PieChart width={400} height={300}>
                <Pie
                  data={getAsignaturasData()}
                  dataKey="count"
                  nameKey="asignatura"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {getAsignaturasData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORSBAR[index % COLORSBAR.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </div>

            
          </div>
        </div>
      ) : (
        <p>No hay alumnos...</p>
      )}
    </div>
  );
};

export default Reportes;
