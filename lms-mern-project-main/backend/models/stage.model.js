import { model, Schema } from "mongoose";

const stageSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Stage name is required'],
        trim: true,
        maxLength: [50, 'Stage name should be less than 50 characters'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Stage description is required'],
        maxLength: [200, 'Stage description should be less than 200 characters']
    },
    order: {
        type: Number,
        required: [true, 'Stage order is required'],
        min: [1, 'Order must be at least 1']
    },
    color: {
        type: String,
        default: '#3B82F6',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Color must be a valid hex color code'
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    subjectsCount: {
        type: Number,
        default: 0
    },
    studentsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create index for better search performance
stageSchema.index({ name: 'text', description: 'text' });
stageSchema.index({ order: 1 });

const Stage = model("Stage", stageSchema);

export default Stage; 