import multerConfig from '../config/Multer'

const uploadMiddleware = multerConfig.single('profilePic')

export default uploadMiddleware
