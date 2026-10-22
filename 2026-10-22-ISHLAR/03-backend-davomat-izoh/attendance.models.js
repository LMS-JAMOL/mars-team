const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "group",
            required: true
        },

        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mentor",
            required: true
        },

        date: {
            type: Date,
            default: Date.now
        },

        lessonSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LessonSession",
            default: null
        },

        notes: {
            type: String,
            default: null,
            maxlength: 1000
        },

        records: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "students",
                    required: true
                },

                present: {
                    type: Boolean,
                    default: true
                },

                status: {
                    type: String,
                    enum: ["present", "absent", "late", "excused"],
                    default: "present"
                },

                note: {
                    type: String,
                    default: null,
                    maxlength: 500
                }
            }
        ],

        /**
         * Audit trail of the marks that were changed after the record was
         * created. The CEO can see who changed a mark, when and why.
         */
        changes: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "students",
                    required: true
                },
                from: {
                    type: String,
                    enum: ["present", "absent", "late", "excused", "none"],
                    default: "none"
                },
                to: {
                    type: String,
                    enum: ["present", "absent", "late", "excused", "none"],
                    default: "none"
                },
                reason: {
                    type: String,
                    default: null,
                    maxlength: 500
                },
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: "changedByModel",
                    default: null
                },
                changedByModel: {
                    type: String,
                    enum: ["admins", "bm", "ceo", "mentor", "tutor", "intern"],
                    default: "mentor"
                },
                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

attendanceSchema.index(
  { group: 1, lessonSession: 1 },
  { unique: true, partialFilterExpression: { lessonSession: { $ne: null } } }
)
attendanceSchema.index({ group: 1, date: -1 })
attendanceSchema.index({ mentor: 1, date: -1 })
attendanceSchema.index({ "records.student": 1 })
attendanceSchema.index({ lessonSession: 1 })

module.exports = mongoose.model("attendance", attendanceSchema)
