import { useEffect, useState } from "react";

// Адрес API берётся из frontend/.env (VITE_API_URL), по умолчанию локальный сервер
const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/tasks/";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    catName: "",
    catColor: "#3366ff",
  });

  const setField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Получить список задач (GET)
  async function loadTasks() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      setTasks(await res.json());
    } catch {
      setError("Не удалось загрузить задачи. Проверьте, что API запущен и настроен CORS.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Добавить задачу (POST)
  async function addTask(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: { name: form.catName, color: form.catColor },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Ошибки валидации FastAPI приходят списком в data.detail
        setError(
          Array.isArray(data.detail)
            ? data.detail.map((d) => d.msg).join("; ")
            : data.detail
        );
        return;
      }

      setForm({ title: "", description: "", catName: "", catColor: form.catColor });
      loadTasks();
    } catch {
      setError("Нет связи с API.");
    }
  }

  return (
    <section>
      <form onSubmit={addTask} className="form">
        <input
          value={form.title}
          onChange={setField("title")}
          placeholder="Название (минимум 3 символа)"
        />
        <input
          value={form.description}
          onChange={setField("description")}
          placeholder="Описание"
        />
        <div className="row">
          <input
            value={form.catName}
            onChange={setField("catName")}
            placeholder="Категория"
          />
          <input type="color" value={form.catColor} onChange={setField("catColor")} />
        </div>
        <button type="submit">Добавить задачу</button>
        {error && <p className="error">{error}</p>}
      </form>

      <h2>Список задач</h2>
      {loading && <p>Загрузка...</p>}
      {!loading && tasks.length === 0 && <p>Задач пока нет. Добавьте первую.</p>}
      {tasks.map((t, i) => (
        <div className="task" key={i}>
          <b>{t.title}</b> {t.is_completed && "✅"}
          <div>{t.description}</div>
          <span style={{ color: t.category.color }}>● {t.category.name}</span>
        </div>
      ))}
    </section>
  );
}