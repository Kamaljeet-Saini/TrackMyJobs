import Job from "../models/Job.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors/index.js";
import checkPermissions from "../utils/checkPermissions.js";
import mongoose from "mongoose";
import moment from "moment";

const createJob = async (req, res) => {
  const { position, company } = req.body;
  if (!position || !company) {
    //We don't check for other values because we have already set their default values in Job model
    throw new BadRequestError("Please provide all the values");
  }

  //createdBy is a property of a job
  req.body.createdBy = req.user.userId;

  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }
  checkPermissions(req.user, job.createdBy);
  //await job.remove();
  Job.deleteOne({ _id: jobId })
    .then(() => {
      console.log("Job deleted successfully");
    })
    .catch((error) => {
      console.error("Error deleting job:", error);
    });
  res.status(StatusCodes.OK).json({ msg: "Success! Job removed" });
};

const getAllJobs = async (req, res) => {
  const { search, status, jobType, sort } = req.query;
  const queryObject = {
    createdBy: req.user.userId,
  };

  //Add stuff based on the condition
  if (status && status !== "all") {
    queryObject.status = status;
  }
  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }
  if (search) {
    //if we simply use search in-place of regex we will have to provide the complete name of the position in order to search
    //Regex will enable us to write few words and it will try to match possible solutions to the search
    queryObject.position = { $regex: search, $options: "i" };
  }

  //No await
  console.log(queryObject);
  let result = Job.find(queryObject);

  //chain sort conditions
  //negative sign indicates descending order wrt to a field / query param
  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position, jobLocation, jobType, status } = req.body;
  if (!position || !company) {
    throw new BadRequestError("Please provide all the values");
  }
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with ${jobId} exists`);
  }

  //check permissions
  checkPermissions(req.user, job.createdBy);

  //runValidators complain only when value of some property specified in req.body is missing
  //if a property isn't provided at all then it doesn't complain!

  //const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
  //new: true,
  //runValidators: true,
  //});

  job.position = position;
  job.company = company;
  job.jobLocation = jobLocation;
  job.jobType = jobType;
  job.status = status;

  await job.save();
  res.status(StatusCodes.OK).json({ job });
};

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      //We need to group by both year and the month
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    //We sort the groups by latest year and months
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    //We just want to display bar/area chart for last 6 months so we put a limit
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      //in moment, month counts values from 0-11 but in mongoDb we get values from 1-12
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();
  //we reverse because it displays the latest month first but we wish to go displaying from oldest month to the latest month

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

export { createJob, deleteJob, getAllJobs, updateJob, showStats };
