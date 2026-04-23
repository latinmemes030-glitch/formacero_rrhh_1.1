import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// 🧠 ADAPTADOR tipo MySQL → Supabase
export const db = {
  query: async (sql, params, callback) => {
    try {
      // 🔍 NORMALIZAR PARAMS
      if (typeof params === "function") {
        callback = params;
        params = [];
      }

      let data = null;
      let error = null;

      // 🔥 SELECT
      if (sql.trim().toUpperCase().startsWith("SELECT")) {

        if (sql.includes("FROM empleados")) {
          const res = await supabase.from("empleados").select("*");
          data = res.data;
          error = res.error;
        }

        else if (sql.includes("FROM exempleados")) {
          const res = await supabase.from("exempleados").select("*");
          data = res.data;
          error = res.error;
        }

        else if (sql.includes("FROM usuarios")) {
          const res = await supabase.from("usuarios").select("*");
          data = res.data;
          error = res.error;
        }

        else if (sql.includes("FROM reportes")) {
          const res = await supabase.from("reportes").select("*");
          console.log("Supabase select reportes res:", res);
          data = res.data || [];
          error = res.error;
        }
      }

      // 🔥 INSERT empleados
      else if (sql.includes("INSERT INTO empleados")) {
        const [
          nombre,
          documento,
          correo,
          cargo,
          salario,
          fecha_ingreso,
          departamento,
          fecha_nacimiento
        ] = params;

        const res = await supabase.from("empleados").insert([{
          nombre,
          documento,
          correo,
          cargo,
          salario,
          fecha_ingreso,
          departamento,
          estado: "activo",
          fecha_nacimiento
        }]).select();

        data = { insertId: res.data?.[0]?.id };
        error = res.error;
      }

      // 🔥 INSERT reportes
      else if (sql.includes("INSERT INTO reportes")) {
        const [empleado_id, descripcion, fecha] = params;

        const payload = {
          empleado_id,
          descripcion,
          fecha: fecha ? new Date(fecha) : new Date()
        };

        const res = await supabase.from("reportes").insert([payload]).select();
        data = { insertId: res.data?.[0]?.id };
        error = res.error;
      }

      // 🔥 INSERT usuarios
      else if (sql.includes("INSERT INTO usuarios")) {
        const [nombre, correo, password, rol, empleado_id, username] = params;

        const res = await supabase.from("usuarios").insert([{
          nombre,
          correo,
          password,
          rol,
          empleado_id,
          username
        }]);

        data = res.data;
        error = res.error;
      }

      // 🔥 UPDATE reportes
      else if (sql.includes("UPDATE reportes")) {
        const [estado, decision, id] = params;

        const res = await supabase
          .from("reportes")
          .update({ estado, decision })
          .eq("id", id);

        data = res.data;
        error = res.error;
      }

      // 🔥 DELETE reportes
      else if (sql.includes("DELETE FROM reportes")) {
        const [id] = params;

        const res = await supabase
          .from("reportes")
          .delete()
          .eq("id", Number(id))
          .select();

        data = res.data;
        error = res.error;
      }

      // 🔥 UPDATE empleados
      else if (sql.includes("UPDATE empleados")) {
        const [nombre, cargo, departamento, id] = params;

        const res = await supabase
          .from("empleados")
          .update({ nombre, cargo, departamento })
          .eq("id", id);

        data = res.data;
        error = res.error;
      }

      // 🔥 DELETE empleados
      else if (sql.includes("DELETE FROM empleados")) {
        const [id] = params;

        const res = await supabase
          .from("empleados")
          .delete()
          .eq("id", id);

        data = res.data;
        error = res.error;
      }

      // 🔥 INSERT exempleados
      else if (sql.includes("INSERT INTO exempleados")) {
        const [
          nombre,
          documento,
          correo,
          telefono,
          cargo,
          departamento,
          fecha_ingreso,
          motivo
        ] = params;

        const res = await supabase.from("exempleados").insert([{
          nombre,
          documento,
          correo,
          telefono,
          cargo,
          departamento,
          fecha_ingreso,
          fecha_retiro: new Date(),
          razon_despido: motivo
        }]);

        data = res.data;
        error = res.error;
      }

      // 🔥 DELETE exempleados
      else if (sql.includes("DELETE FROM exempleados")) {
        const [id] = params;

        const res = await supabase
          .from("exempleados")
          .delete()
          .eq("id", id);

        data = res.data;
        error = res.error;
      }

      // 🔥 DEFAULT (por si algo no está cubierto)
      else {
        console.warn("⚠️ Query no soportada aún:", sql);
      }

      if (error) {
        return callback(error, null);
      }

      callback(null, data);

    } catch (err) {
      console.error("❌ ERROR GENERAL DB:", err);
      callback(err, null);
    }
  }
};

console.log("✅ Supabase conectado (modo compatibilidad)");