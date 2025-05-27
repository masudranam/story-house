//auth table
const Auth = db.define('auth',{
    id:{
        type:DataTypes.STRING,
        primaryKey: true
    },
    userId:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    }
   },
    {
        freezeTableName: true,
        tableName: 'auth',
        createdAt: false,
        updatedAt: false
    }
);

await Auth.sync( );