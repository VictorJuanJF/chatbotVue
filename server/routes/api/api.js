const express = require("express");
const router = express.Router();
const {
  listIntents,
  updateIntent,
} = require("../../chatbot/dialogFlowApiFunctions");
const authUserService = require("../../database/auth_users");
const chatbotUserService = require("../../database/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const agenciesService = require("../../database/agencies");
const regionsService = require("../../database/regions");
var fs = require("fs");
//auth
router.post("/login", async (req, res) => {
  let body = req.body;
  let user = {
    email: body.email,
    password: body.password,
  };
  try {
    let result = await authUserService.login(user);
    if (!result) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "(Usuario) o contraseña incorrectos",
        },
      });
    }
    let passwordIsValid = bcrypt.compareSync(user.password, result.password);
    if (!passwordIsValid) {
      console.log("no se cumplio la pass");
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o (contraseña) incorrectos",
        },
      });
    }
    let token = jwt.sign(
      {
        result,
      },
      process.env.SEED,
      {
        expiresIn: parseInt(process.env.CADUCIDAD),
      }
    );
    res.status(200).json({
      ok: true,
      token,
      payload: result,
      message: "Bienvenido!",
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});

router.post("/users/confirm-password", async (req, res) => {
  let body = req.body;
  let user = {
    email: body.email,
    password: body.password,
  };
  try {
    let result = await authUserService.login(user);
    let passwordIsValid = bcrypt.compareSync(user.password, result.password);
    if (!passwordIsValid) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Contraseña incorrecta",
        },
      });
    }
    res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});

router.post("/user/update-password", async (req, res) => {
  let body = req.body;
  let email = body.email;
  let newPassword = body.newPassword;
  try {
    await authUserService.updatePassword(email, newPassword);
    res.status(200).json({
      ok: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: {
        message: "Algo salió mal",
      },
    });
  }
});

router.post("/register", async (req, res) => {
  let body = req.body;
  let user = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    password: body.password,
    role: body.role,
    status: body.status,
  };
  try {
    res.json({
      ok: true,
      payload: await authUserService.registerUser(user),
      message: "Usuario creado con exito!",
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});

router.get("/auth-users/list", async (req, res) => {
  try {
    res.status(200).json({
      ok: true,
      payload: await authUserService.list(),
      message: "",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});
router.post("/auth-users/delete", async (req, res) => {
  let email = req.body.email;
  try {
    await authUserService.deleteUser(email);
    res.status(200).json({
      ok: true,
      message: "Usuario desactivado con éxito",
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});
router.put("/auth-users/update", async (req, res) => {
  let body = req.body;
  let user = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    role: body.role,
    status: body.status,
  };
  try {
    res.status(200).json({
      ok: true,
      payload: await authUserService.updateUser(user),
      message: "Datos de usuario actualizados con éxito",
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});
//chatbot
router.get("/chatbot/users/list", async (req, res) => {
  try {
    let chatbotUsers = await chatbotUserService.list();
    res.status(200).json({
      ok: true,
      payload: chatbotUsers,
      message: "",
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      err,
    });
  }
});
router.get("/chatbot/agent/intents", (req, res) => {
  try {
    let payload = listIntents((callback) => {
      res.json({
        ok: true,
        payload: callback,
      });
    });
  } catch (e) {
    console.log("hubo un error:", e);
    // next(e);
  }
});
//update intent
router.put("/chatbot/agent/intents/update", (req, res) => {
  let newIntent = req.body.newIntent;
  try {
    let payload = updateIntent(newIntent, (callback) => {
      res.json({
        ok: true,
        payload: callback,
        message: "Intención actualizada con éxito",
      });
    });
  } catch (e) {
    console.log("hubo un error:", e);
    // next(e);
  }
});

router.post("/chatbot/agent/persistantmenu", (req, res) => {
  let buttons = req.body.buttons;
  console.log("los botones son: ", buttons);
  let rawFormat = {
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: buttons,
      },
    ],
  };
  //   console.log("el menu: ", JSON.stringify(rawFormat, null, " "));
  axios
    .post(
      "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=" +
        process.env.FB_PAGE_TOKEN,
      rawFormat,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      res.status(200).json({
        ok: true,
        payload: "Persistant menu updated",
        message: "Menú persistente actualizado con éxito",
      });
      console.log("respuesta de facebook: ", response);
      fs.writeFile(
        __dirname + "/../../chatbot/menu/persistantMenu.json",
        JSON.stringify(buttons),
        function (err) {
          if (err) throw err;
          console.log("complete saved file");
        }
      );
    })
    .catch((err) => {
      //   console.log(err);
      return res.status(400).json({
        ok: false,
        err,
      });
    });
});

router.get("/chatbot/agent/persistantmenu/list", (req, res) => {
  try {
    let rawdata = fs.readFileSync(
      __dirname + "/../../chatbot/menu/persistantMenu.json"
    );
    rawdata = JSON.parse(rawdata);
    if (rawdata) {
      res.json({
        ok: true,
        payload: rawdata,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      ok: false,
      err,
    });
  }
});

router.get("/chatbot/agent/agencies/list", async (req, res) => {
  try {
    res.json({
      ok: true,
      payload: await agenciesService.listAgencies(),
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      err,
    });
  }
});

router.post("/chatbot/agent/agencies/delete", async (req, res) => {
  let id = req.body.id;
  try {
    res.json({
      ok: true,
      payload: await agenciesService.deleteAgency(id),
      message: "Agencia eliminada con éxito",
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});

router.get("/regions/list", async (req, res) => {
  try {
    res.json({
      ok: true,
      payload: await regionsService.listRegions(),
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      error,
    });
  }
});
router.post("/agencies/create", async (req, res) => {
  let newAgency = req.body.newAgency;
  if (newAgency.agency_name.length == 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "El nombre de la agencia debe estar completo",
      },
    });
  }
  try {
    res.json({
      ok: true,
      payload: await agenciesService.createAgency(newAgency),
      message: "Agencia creada con éxito",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      error,
    });
  }
});
router.put("/agencies/update", async (req, res) => {
  let body = req.body;
  let id = req.body.id;
  let agency = {
    address: body.address,
    agency_name: body.agency_name,
    reference: body.reference,
    region: body.region,
    schedule: body.schedule,
    synonyms: body.synonyms,
  };
  try {
    res.status(200).json({
      ok: true,
      payload: await agenciesService.updateAgency(id, agency),
      message: "Datos de agencia actualizados con éxito",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});

module.exports = router;
