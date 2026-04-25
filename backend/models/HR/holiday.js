module.exports = (sequelize, DataTypes) => {
  const Holiday = sequelize.define('Holiday', {
    hno: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    hdate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hdesc: {
      type: DataTypes.STRING(100)
    },
    hday: {
      type: DataTypes.STRING(30)
    },
    yr: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hremarks: {
      type: DataTypes.STRING(200)
    },
    c_gen_user: DataTypes.BIGINT,
    c_gen_date: DataTypes.DATE
  }, {
    tableName: 'holidays',
    freezeTableName: true,
    timestamps: false
  });

  return Holiday;
};