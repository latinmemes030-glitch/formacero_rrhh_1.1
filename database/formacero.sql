CREATE DATABASE formacero_rrhh;
USE formacero_rrhh;

-- USUARIOS
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100),
  password VARCHAR(100),
  rol VARCHAR(50)
);

-- EMPLEADOS
CREATE TABLE empleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  cargo VARCHAR(100),
  salario DECIMAL(10,2),
  fecha_ingreso DATE,
  correo VARCHAR(100),
  telefono VARCHAR(20)
);

-- EX EMPLEADOS
CREATE TABLE exempleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100),
  telefono VARCHAR(20),
  razon_despido TEXT,
  fecha_salida DATE
);

-- REPORTES
CREATE TABLE reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id INT,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);

-- ORGANIZACION (pirámide)
CREATE TABLE organizacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id INT,
  jefe_id INT,
  rol VARCHAR(100),
  FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);

Credenciales del administrador: 
📧 Correo: admin@formacero.com
🔑 Password: Admin123*