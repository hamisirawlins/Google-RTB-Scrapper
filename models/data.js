import mongoose from "mongoose";

const dataSchema = mongoose.Schema({
    created_at: { type: Date, default: new Date() },
    tag: String,
    discovery_data: Array,
})

const DataCapsule = mongoose.model('dataSchema', dataSchema);

export default DataCapsule;