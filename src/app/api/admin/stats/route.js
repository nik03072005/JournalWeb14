import { connectToDatabase } from '@/lib/db';
import Journal from '@/models/journelModel';
import Subject from '@/models/subjectModel';
import Type from '@/models/typeModel';
import UserModel from '@/models/userModel';
import NodeCache from 'node-cache';

// Initialize in-memory cache
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // Cache for 5 minutes

export async function GET(req) {
  try {
    // Check cache first
    const cacheKey = 'admin-stats';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return Response.json({
        success: true,
        data: cachedData,
      });
    }

    await connectToDatabase();

    // Get local data counts with optimized queries
    const [localJournals, subjects, types, users] = await Promise.all([
      Journal.find()
        .populate('subject', 'subjectName')
        .populate('detail')
        .lean()
        .select('type subject detail'), // Select only needed fields
      Subject.find().lean().select('subjectName'),
      Type.find().lean().select('name'),
      UserModel.find().lean().select('role'),
    ]);

    // Count local data by types
    const localTypeStats = {};
    localJournals.forEach((journal) => {
      const type = journal.type || 'Unknown';
      localTypeStats[type] = (localTypeStats[type] || 0) + 1;
    });

    // Count by subjects
    const subjectStats = {};
    localJournals.forEach((journal) => {
      const subjectName = journal.subject?.subjectName || 'Unknown';
      subjectStats[subjectName] = (subjectStats[subjectName] || 0) + 1;
    });

    // Count users by role
    const userRoleStats = {};
    users.forEach((user) => {
      const role = user.role || 'user';
      userRoleStats[role] = (userRoleStats[role] || 0) + 1;
    });

    // Count journals by indexing types
    const indexingStats = {
      Scopus: 0,
      'Web of Science': 0,
      UGC: 0,
      'Peer Reviewed': 0,
    };

    localJournals.forEach((journal) => {
      if (journal.detail && Array.isArray(journal.detail.indexing)) {
        journal.detail.indexing.forEach((index) => {
          if (indexingStats.hasOwnProperty(index)) {
            indexingStats[index]++;
          }
        });
      }
    });

    // Count articles vs books locally with expanded classification
    const localArticles = localJournals.filter((journal) =>
      journal.type &&
      (
        journal.type.toLowerCase().includes('research paper') ||
        journal.type.toLowerCase().includes('article') ||
        journal.type.toLowerCase().includes('conference proceeding') ||
        journal.type.toLowerCase().includes('thesis') ||
        journal.type.toLowerCase().includes('dissertation')
      )
    ).length;

    const localBooks = localJournals.filter((journal) =>
      journal.type &&
      (
        journal.type.toLowerCase().includes('book') ||
        journal.type.toLowerCase().includes('magazine') ||
        journal.type.toLowerCase().includes('manuscript')
      )
    ).length;

    // Prepare response data
    const stats = {
      overview: {
        totalLocalItems: localJournals.length,
        totalSubjects: subjects.length,
        totalTypes: types.length,
        totalUsers: users.length,
        totalLocalArticles: localArticles,
        totalLocalBooks: localBooks,
      },
      localTypeBreakdown: localTypeStats,
      subjectBreakdown: subjectStats,
      userRoleBreakdown: userRoleStats,
      indexingBreakdown: indexingStats, // Added from updated code
      contentTypeComparison: {
        articles: localArticles,
        books: localBooks,
        other: localJournals.length - localArticles - localBooks,
      },
    };

    // Cache the result
    cache.set(cacheKey, stats);

    return Response.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Admin stats error:', {
      message: error.message,
      stack: error.stack,
    });
    return Response.json(
      {
        success: false,
        error: `Failed to fetch admin statistics: ${error.message}`,
      },
      { status: 500 }
    );
  }
}