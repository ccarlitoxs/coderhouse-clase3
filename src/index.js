const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class Contenedor {

    constructor(fileName) {
        this.fileName=fileName;
        this.id = 0;
        this.data =[];
    }

    async save(objeto) {
        await this.getAll();
        this.id++;
        this.data.push({
            id:this.id,
            product: objeto
        })
        await fs.promises.writeFile(`./src/Productos/${this.fileName}`,JSON.stringify(this.data, null, 2));
        return this.id;
    }

    async getById(id) {
        await this.getAll();
        return this.data.find((producto) => producto.id === id)
    }

    async getAll() {
        try {
            const data = await fs.promises.readFile(`./src/Productos/${this.fileName}`, 'utf-8')
            if (data) {
                this.data = JSON.parse(data);
                this.data.map((producto) => {
                    if (this.id < producto.id) {
                        this.id = producto.id
                    }
                })
                return this.data;
            }
        } catch (error) {
            return 
        }
    }

    async deleteById(id) {
        await this.getAll();
        await fs.promises.unlink(`./src/Productos/${this.fileName}`);
        const data = this.data.filter((producto) => producto.id !== id);
        await fs.promises.writeFile(`./src/Productos/${this.fileName}`,JSON.stringify(data, null, 2));
    }

    async deleteAll() {
        await fs.promises.unlink(`./src/Productos/${this.fileName}`);
        this.id = 0;
        this.data =[];
    }

}

const productos = new Contenedor('productos.txt');

app.get('/productos', async (req, res) => {
	res.status(200).json(await productos.getAll())
})

app.get('/productoRandom', async (req, res) => {
    const productos = await productos.getAll();
    if (productos.length > 0) {
        const numero = Math.floor(Math.random() * (productos.length - 0)) + 0;
        res.status(200).json(productos[numero])
    } else {
        res.status(200).json({msg:"no hay productos"})
    }
	
})

const PORT = 8080

app.listen(PORT, () => {
	console.log(`Server on port ${PORT}`)
})


