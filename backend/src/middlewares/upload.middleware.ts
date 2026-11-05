import multerConfig from '../config/Multer'

const uploadMiddleware = multerConfig.single('profilePic')

export const uploadPlayerPhoto = multerConfig.single('photo')
export const uploadTeamLogo = multerConfig.single('logo')

export default uploadMiddleware
