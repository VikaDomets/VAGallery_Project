import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './db.js';

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                birthday VARCHAR(20),
                role VARCHAR(20) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                avatar_url TEXT,            
                bio TEXT,                   
                skills VARCHAR(255),
                cover_url TEXT,
                city VARCHAR(100),
                country VARCHAR(100),       
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS skills VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS artworks (
                id SERIAL PRIMARY KEY,
                artist_id INTEGER REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                price NUMERIC NOT NULL,
                description TEXT,
                image_url TEXT,
                size VARCHAR(50),
                tech VARCHAR(100),
                status VARCHAR(50) DEFAULT 'pending',
                is_for_sale BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE artworks ADD COLUMN IF NOT EXISTS size VARCHAR(50);
            ALTER TABLE artworks ADD COLUMN IF NOT EXISTS tech VARCHAR(100);
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS exhibitions (
                id SERIAL PRIMARY KEY,
                artist_id INTEGER REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                date_range VARCHAR(100),
                location VARCHAR(255),
                description TEXT,
                image_url TEXT,
                funding_goal NUMERIC DEFAULT 0,
                current_funding NUMERIC DEFAULT 0,
                status VARCHAR(50) DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
            // Створюємо таблицю інвестицій
            await pool.query(`
            CREATE TABLE IF NOT EXISTS investments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                exhibition_id INTEGER REFERENCES exhibitions(id),
                amount NUMERIC NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Таблиці успішно перевірені/створені!');
    } catch (err) { console.error('❌ Помилка створення таблиць:', err); }
};
createTables();

// ==========================================
// 2. РЕЄСТРАЦІЯ ТА ЛОГІН
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, birthday, role, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            `INSERT INTO users (name, email, phone, birthday, role, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role`,
            [name, email, phone, birthday, role, passwordHash]
        );
        res.status(201).json({ message: "Успішно!", user: newUser.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: "E-mail вже існує!" });
        res.status(500).json({ message: "Помилка сервера" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(401).json({ message: 'E-mail не знайдено' });
        
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Неправильний пароль' });
        
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ message: 'Вхід успішний!', token: token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, birthday: user.birthday, bio: user.bio, skills: user.skills, avatar_url: user.avatar_url, cover_url: user.cover_url, city: user.city, country: user.country } });
    } catch (err) { res.status(500).json({ message: 'Помилка сервера' }); }
});

app.put('/api/users/:id', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, email, phone, bio, skills, city, country } = req.body;
        const userId = req.params.id;

        let updateFields = [];
        let params = [];
        let paramCount = 1;

        const addField = (fieldName, value) => {
            if (value !== undefined) {
                updateFields.push(`${fieldName} = $${paramCount}`);
                params.push(value);
                paramCount++;
            }
        };

        addField('name', name); addField('email', email); addField('phone', phone);
        addField('bio', bio); addField('skills', skills); addField('city', city); addField('country', country);

        if (req.files && req.files['avatar']) addField('avatar_url', `http://localhost:5000/uploads/${req.files['avatar'][0].filename}`);
        if (req.files && req.files['cover']) addField('cover_url', `http://localhost:5000/uploads/${req.files['cover'][0].filename}`);

        params.push(userId); 
        
        const updatedUser = await pool.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, phone, birthday, bio, skills, avatar_url, cover_url, city, country`,
            params
        );
        res.json({ message: 'Профіль оновлено!', user: updatedUser.rows[0] });
    } catch (err) { res.status(500).json({ message: "Помилка сервера" }); }
});

// ==========================================
// 3. МАРШРУТИ КАРТИН (ARTWORKS)
// ==========================================   
app.post('/api/artworks', upload.single('image'), async (req, res) => {
    try {
        const { artist_id, title, category, price, description, size, tech, exhibition_id, is_for_sale } = req.body;
        const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : '/img/catalog4.jpg';

        // НАЙВАЖЛИВІШИЙ РЯДОК:
        // Перетворюємо будь-що (рядок "true", "false", або булеве) у справжній true/false
        const saleStatus = String(is_for_sale) === 'true'; 

        const newArt = await pool.query(
            `INSERT INTO artworks (artist_id, title, category, price, description, image_url, status, size, tech, exhibition_id, is_for_sale) 
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10) RETURNING *`,
            [artist_id, title, category, price, description, imageUrl, size, tech, exhibition_id || null, saleStatus]
        );
        res.status(201).json({ message: "Успішно!", artwork: newArt.rows[0] });
    } catch (err) {
        res.status(500).send("Помилка");
    }
});

app.get('/api/artworks/artist/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM artworks WHERE artist_id = $1 ORDER BY created_at DESC', [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: "Помилка" }); }
});

app.get('/api/artworks/pending', async (req, res) => {
    try {
        const result = await pool.query(`SELECT artworks.*, users.name as artist_name FROM artworks JOIN users ON artworks.artist_id = users.id WHERE artworks.status = 'pending' ORDER BY artworks.created_at DESC`);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: "Помилка" }); }
});

app.get('/api/artworks/catalog', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT artworks.*, users.name as artist_name 
            FROM artworks 
            JOIN users ON artworks.artist_id = users.id 
            WHERE artworks.status = 'approved' AND artworks.is_for_sale = TRUE 
            ORDER BY artworks.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: "Помилка" }); }
});

// >>> ОСЬ ВІДНОВЛЕНИЙ МАРШРУТ ДЛЯ СТОРІНКИ КАРТИНИ <<<
app.get('/api/artworks/:id', async (req, res) => {
    try {
        const artId = req.params.id;
        const result = await pool.query(`
            SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar, u.country as artist_country
            FROM artworks a JOIN users u ON a.artist_id = u.id WHERE a.id = $1
        `, [artId]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: "Картину не знайдено" });
        
        const artistId = result.rows[0].artist_id;
        const otherWorks = await pool.query(`
            SELECT * FROM artworks WHERE artist_id = $1 AND id != $2 AND status IN ('approved', 'sold') LIMIT 4
        `, [artistId, artId]);

        res.json({ ...result.rows[0], other_works: otherWorks.rows });
    } catch (err) { res.status(500).json({ message: "Помилка сервера" }); }
});

app.patch('/api/artworks/:id/status', async (req, res) => {
    try {
        await pool.query('UPDATE artworks SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
        res.json({ message: `Успішно!` });
    } catch (err) { res.status(500).json({ message: "Помилка" }); }
});

app.delete('/api/artworks/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM artworks WHERE id = $1', [req.params.id]);
        res.json({ message: "Видалено" });
    } catch (err) { res.status(500).json({ message: "Помилка" }); }
});
app.delete('/api/exhibitions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM exhibitions WHERE id = $1', [id]);
        res.json({ message: "Виставку видалено успішно" });
    } catch (err) {
        res.status(500).json({ message: "Помилка при видаленні" });
    }
});
// ==========================================
// 4. МАРШРУТИ ВИСТАВОК (EXHIBITIONS)
// ==========================================
app.post('/api/exhibitions', upload.single('image'), async (req, res) => {
    try {
        const { artist_id, title, start_date, end_date, location, description, funding_goal } = req.body;
        const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : '/img/placeholder.jpg';

        const newExh = await pool.query(
            `INSERT INTO exhibitions (artist_id, title, start_date, end_date, location, description, image_url, funding_goal) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [artist_id, title, start_date, end_date, location, description, imageUrl, funding_goal]
        );
        res.status(201).json(newExh.rows[0]);
    } catch (err) { res.status(500).send("Помилка"); }
});

app.get('/api/exhibitions/artist/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM exhibitions WHERE artist_id = $1 ORDER BY created_at DESC', 
            [req.params.id]
        );
        res.json(result.rows); // Повертає масив (навіть якщо він порожній [])
    } catch (err) {
        res.status(500).json([]); 
    }
});

app.get('/api/exhibitions', async (req, res) => {
    try {
        const result = await pool.query(`SELECT e.*, u.name as artist_name, u.avatar_url as artist_avatar FROM exhibitions e JOIN users u ON e.artist_id = u.id ORDER BY e.created_at DESC`);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: "Помилка" }); }
});

// ==========================================
// 11.5 ОТРИМАННЯ ДЕТАЛЕЙ ОДНІЄЇ ВИСТАВКИ ТА ЇЇ КАРТИН
// ==========================================
app.get('/api/exhibitions/:id', async (req, res) => {
    try {
        const exhId = req.params.id;
        
        // 1. Беремо виставку + інформацію про автора
        const result = await pool.query(`
            SELECT e.*, u.name as artist_name, u.avatar_url as artist_avatar, u.bio as artist_bio 
            FROM exhibitions e
            JOIN users u ON e.artist_id = u.id
            WHERE e.id = $1
        `, [exhId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Виставку не знайдено" });
        }

        const exhibitionInfo = result.rows[0];

        // 2. Витягуємо всі СХВАЛЕНІ картини, які прив'язані до цієї виставки!
        const artworksResult = await pool.query(`
            SELECT * FROM artworks 
            WHERE exhibition_id = $1 AND status IN ('approved', 'sold')
            ORDER BY created_at DESC
        `, [exhId]);

        // Віддаємо деталі виставки разом із масивом її реальних картин
        res.json({
            ...exhibitionInfo,
            artworks: artworksResult.rows
        });

    } catch (err) {
        console.error('Помилка завантаження деталей виставки:', err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// ==========================================
// 5. МАРШРУТИ ХУДОЖНИКІВ (ARTISTS)
// ==========================================
app.get('/api/artists', async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT id, 
        name, 
        avatar_url, 
        bio, 
        skills 
        FROM users WHERE role = 'artist' ORDER BY created_at DESC`);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: "Помилка сервера" }); }
});

// Профіль художника (Збирає все: інфу, картини, виставки та реальних інвесторів з БД)
app.get('/api/artists/:id', async (req, res) => {
    try {
        const artistId = req.params.id;
        
        // Інфо про юзера
        const userResult = await pool.query(`
            SELECT id, name, avatar_url, cover_url, bio, skills, city, country, birthday 
            FROM users WHERE id = $1 AND role = 'artist'
        `, [artistId]);
        
        if (userResult.rows.length === 0) return res.status(404).json({ message: "Художника не знайдено" });
        const artistInfo = userResult.rows[0];

        // Картини
        const artworksResult = await pool.query(`
            SELECT * FROM artworks WHERE artist_id = $1 AND status IN ('approved', 'sold') ORDER BY created_at DESC
        `, [artistId]);

        // Виставки
        const exhResult = await pool.query(`
            SELECT * FROM exhibitions WHERE artist_id = $1 ORDER BY created_at DESC
        `, [artistId]);

        // Отримуємо РЕАЛЬНИХ інвесторів для виставок цього художника з бази даних!
        const investorsResult = await pool.query(`
            SELECT i.amount, u.name as investor_name, u.role as investor_role, u.avatar_url as investor_avatar, e.title as exhibition_title
            FROM investments i
            JOIN users u ON i.user_id = u.id
            JOIN exhibitions e ON i.exhibition_id = e.id
            WHERE e.artist_id = $1
            ORDER BY i.created_at DESC
        `, [artistId]);

        // Віддаємо все разом!
        res.json({
            ...userResult.rows[0],
            artworks: artworksResult.rows,
            exhibitions: exhResult.rows,
            investors: investorsResult.rows // <--- Додали масив реальних інвесторів
        });

    } catch (err) {
        console.error('Помилка завантаження профілю:', err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});


app.post('/api/investments', async (req, res) => {
    try {
        const { user_id, exhibition_id, amount } = req.body;

        // 1. Записуємо транзакцію в таблицю investments
        await pool.query(
            `INSERT INTO investments (user_id, exhibition_id, amount) VALUES ($1, $2, $3)`,
            [user_id, exhibition_id, amount]
        );

        // 2. Оновлюємо суму збору в таблиці exhibitions
        await pool.query(
            `UPDATE exhibitions SET current_funding = current_funding + $1 WHERE id = $2`,
            [amount, exhibition_id]
        );

        res.status(201).json({ message: "Інвестицію успішно зараховано!" });
    } catch (err) {
        console.error('Помилка проведення інвестиції:', err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});
// ЗАПУСК
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 Сервер запущено на порту ${PORT}`); });