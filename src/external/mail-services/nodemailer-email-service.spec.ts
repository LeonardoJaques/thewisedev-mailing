import { NodemailerEmailService } from './nodemailler-email-service'
import { EmailOptions } from '../../usecases/ports/email-service'
import nodemailer from 'nodemailer'
import { Right } from '../../shared/either'

jest.mock('nodemailer', () => ({
  createTransport (options: Object): Object {
    return {
      sendMail (): any {
        return 'ok'
      }
    }
  }
}))

const makeSut = (): NodemailerEmailService => {
  return new NodemailerEmailService()
}

const attachmentFilePath: string = 'any_file_path'

const fromName = 'Test'
const fromEmail = 'from_email@mail.com'
const toName = 'any_name'
const toEmail = 'any_email@mail.com'
const subject = 'Test e-mail'
const emailBody = 'Hello world attachment test'
const emailBodyHtml = '<b>Hello world attachment test HTML</b>'
const attachments = [{
  filename: attachmentFilePath,
  contentType: 'text/plain'
}]

var mailOptions: EmailOptions = {
  host: 'any_host',
  port: 867,
  username: 'any_username',
  password: 'any_password',
  from: fromName + ' ' + fromEmail,
  to: toName + ' <' + toEmail + '>',
  subject: subject,
  text: emailBody,
  html: emailBodyHtml,
  attachments: attachments
}

describe('Nodemailer mail service adapter', () => {
  test('should return ok if email is sent', async () => {
    const sut = makeSut()
    const result = await sut.send(mailOptions)
    expect(result).toBeInstanceOf(Right)
  })

  test('should return error if email is not sent', async () => {
    const sut = makeSut()
    jest.spyOn(nodemailer, 'createTransport').mockImplementationOnce(() => {
      return {
        sendMail (): any {
          return new Error()
        }
      }
    })
    const result = await sut.send(mailOptions)
    expect(result.value).toBeInstanceOf(Error)
  })

  test('should call nodemailer createTransport with correct options', async () => {
    const sut = makeSut()
    const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport')
    await sut.send(mailOptions)
    expect(spyCreateTransport).toHaveBeenCalledWith({
      host: 'any_host',
      port: 867,
      auth: {
        user: 'any_username',
        pass: 'any_password'
      }
    })
  })
})
