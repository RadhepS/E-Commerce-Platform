import bcrypt = require("bcryptjs");
import { NextFunction, Request, Response } from "express";
import jwt = require("jsonwebtoken");
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";
import { AuthModel } from "../models/auth.model";
import { UserModel } from "../models/user.model";
import { Address } from "../entity/address.entity";
import { AddressModel } from "../models/address.model";
const { checkAuth } = require("../helpers/check-auth");

export class AuthController {
  private userRepository = getRepository(User);
  private adressRepository = getRepository(Address);
  private cookieName = "access_token";

  async createUser(req: Request, res: Response, next: NextFunction) {
    const userExists = await this.userRepository.findOne({
      username: req.body.username
    });
    if (userExists) {
      res.status(404).send("user already exists");
      return;
    }

    //Create and store address

    let address: AddressModel;
    try {
      const reqAddress: AddressModel = {
        street_number: req.body.streetNumber,
        street_name: req.body.streetName,
        unit_number: req.body.unitNumber,
        city: req.body.city,
        province: req.body.province,
        postal_code: req.body.postalCode,
        country: req.body.country
      };
      address = await this.adressRepository.save(reqAddress);
    } catch (err) {
      res.status(404).send("Invalid address");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser: UserModel = {
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      brand_name: req.body.brandName,
      phone_number: req.body.phoneNumber,
      address_id: address.id
    };

    // Save new user to the database
    try {
      const savedUser = await this.userRepository.save(newUser);
      res.status(200).send({
        message: "sucessfully created the user",
        savedUser
      });
    } catch (error) {
      res.status(404).send("an error has occured");
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    // Check if user exists
    const userData = await this.userRepository.findOne({
      username: req.body.username
    });
    if (!userData) {
      res.status(404).send("user does not exist");
      return;
    }

    // Validate password
    const validPassword = await bcrypt.compare(
      req.body.password,
      userData.password
    );
    if (!validPassword) {
      res.status(404).send("invalid password");
      return;
    }

    // Create and return token
    const token = jwt.sign(
      {
        username: userData.username,
        id: userData.id
      },
      "secretKey"
    );

    const addressData = await this.adressRepository.findOne({
      id: userData.address_id
    });

    //Create and return essential user data
    const user = {
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      brand_name: userData.brand_name,
      phone_number: userData.phone_number,
      address: userData.address_id,
      street_name: addressData.street_name,
      street_number: addressData.street_number,
      unit_number: addressData.unit_number,
      city: addressData.city,
      province: addressData.province,
      postal_code: addressData.postal_code,
      country: addressData.country
    };

    res
      .cookie(this.cookieName, token, {
        maxAge: 3600000,
        httpOnly: true
        // uncomment 'secure' when running in production
        // secure: true
      })
      .send({ message: "cookie-set", user });
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    // Find user to delete
    const userToRemove = await this.userRepository.findOne(req.params.id);
    if (!userToRemove) {
      res.status(404).send("error");
      return;
    }

    // Find user to delete
    const removedUser = await this.userRepository.remove(userToRemove);
    if (!removedUser) {
      res.status(404).send("error");
    } else {
      res.status(200).send("successfully deleted");
    }
  }

  async getAuthStatus(req: Request, res: Response, next: NextFunction) {
    let isAuthenticated = false;
    let user: any;
    //Check if the user is authenticated
    const authenticatedUser: AuthModel = checkAuth(req);

    //If authenticated, retrieve user data
    if (authenticatedUser) {
      isAuthenticated = true;
      const userDatabase = await this.userRepository.findOne({
        id: authenticatedUser.id
      });

      //Set user data
      if (userDatabase) {
        const addressDatabase = await this.adressRepository.findOne({
          id: userDatabase.address_id
        });
        user = {
          username: userDatabase.username,
          email: userDatabase.email,
          first_name: userDatabase.first_name,
          last_name: userDatabase.last_name,
          brand_name: userDatabase.brand_name,
          phone_number: userDatabase.phone_number,
          address: userDatabase.address_id,
          street_name: addressDatabase.street_name,
          street_number: addressDatabase.street_number,
          unit_number: addressDatabase.unit_number,
          city: addressDatabase.city,
          province: addressDatabase.province,
          postal_code: addressDatabase.postal_code,
          country: addressDatabase.country
        };
      }
    }
    //Return authentication status and user data
    res.status(200).send({ isAuthenticated, user });
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const authenticatedUser: AuthModel = checkAuth(req);
    if (authenticatedUser) {
      res.clearCookie(this.cookieName);
    }
    res.status(200).end();
  }
}
