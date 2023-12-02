// auth.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from './dto/sign-up.dto';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

@Injectable()
export class AuthService {
  private mailerTransport;
  private otpStore: Record<string, string> = {};
  // private twilioClient: Twilio;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    this.mailerTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: true,
      port: 465,
    });

    //using twilio
    // this.twilioClient = new Twilio(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN,
    // );
  }

  async signUp(
    signUpDto: SignUpDto,
    inviterId?: string,
  ): Promise<SignUpResponseDto> {
    const { password, ...userDetails } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      ...userDetails,
      password: hashedPassword,
    });

    if (inviterId) {
      const inviter = await this.userModel.findById(inviterId);
      if (!inviter) {
        throw new NotFoundException('Inviter not found');
      }
      newUser.partnerId = inviter._id;
      inviter.partnerId = newUser._id;
      await inviter.save(); // Save the inviter with updated partnerId
    }

    try {
      await newUser.save(); // Save the new user
      const payload = { sub: newUser._id };
      return {
        access_token: this.jwtService.sign(payload),
        expires_in: 86400,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'There was an error processing your request',
      );
    }
  }

  async signIn(signInDto: SignInDto): Promise<SignUpResponseDto> {
    const { email_address, password } = signInDto;

    const user = await this.userModel.findOne({
      $or: [{ email_address: email_address }],
    });

    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new ConflictException('Invalid credentials');
    }

    console.log('JWT Secret:', process.env.JWT_SECRET);

    const payload = { sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      expires_in: 86400,
    };
  }

  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const user = await this.userModel.findOne({ email_address: email }).exec();
    return { available: !user };
  }

  async sendOTP(email: string): Promise<{ message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore[email] = otp;

    const mailOptions = {
      from: 'your-email@example.com',
      to: email,
      subject: 'Your OTP',
      text: `Your OTP is: ${otp}`,
    };

    await this.mailerTransport.sendMail(mailOptions);

    setTimeout(() => {
      delete this.otpStore[email];
    }, 300000);
    return { message: 'OTP sent successfully' };
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto): Promise<{ verified: boolean }> {
    const { email_address: email, otp } = verifyOtpDto;
    const validOtp = this.otpStore[email];

    if (otp === validOtp) {
      delete this.otpStore[email];
      return { verified: true };
    } else {
      return { verified: false };
    }
  }

  //using twilio

  // async sendOTP(phoneNumber: string) {
  //   const serviceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID;
  //   let msg = '';
  //   await this.twilioClient.verify.v2
  //   .services(serviceSid)
  //   .verifications.create({ to: phoneNumber, channel: 'sms' })
  //   .then((verification) => (msg = verification.status));
  //   return { msg: msg };
  // }

  // async verifyOTP(phoneNumber: string, code: string) {
  //   const serviceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID;
  //   let msg = '';
  //   await this.twilioClient.verify.v2
  //     .services(serviceSid)
  //     .verificationChecks.create({ to: phoneNumber, code: code })
  //     .then((verification) => (msg = verification.status));
  //   return { msg: msg };
  // }
}
