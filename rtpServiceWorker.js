/*
var worker = this;
//#region Debugging
var DEBUG_ENABLED = false;
console.log('rtpServiceWorker:init');
// //#endregion
// //#region Dependencies
// importScripts('scripts/lodash.js', 'scripts/lodashEx.js', 'app/blocks/utils/enum-extensions.js', 'app/testplayer/models/AttemptState.js', 'app/testplayer/models/AttemptStatus.js', 'app/offline/services/indexeddb-helper.js');
// //#endregion
// //#region IndexedDB Helpers
// var DB = TestPlayer.Offline.Services.DB;
// var DataStore = (function () {
//     function DataStore() {
//     }
//     DataStore.db = function () {
//         return DB.open();
//     };
//     DataStore.isPrepared = function () {
//         return new Promise(function (resolve, reject) {
//             DataStore.db().getInstance().then(function (db) {
//                 var request = db.transaction(DB.tbl.assessmentEvent, DB.transactionMode.readwrite)
//                     .objectStore(DB.tbl.assessmentEvent)
//                     .count();
//                 request.onsuccess = function () { resolve(this.result > 0); };
//                 request.onerror = function () { reject(); };
//             });
//         });
//     };
//     DataStore.getTestDefinitionByOTC = function (sessionCode, oneTimeCode) {
//         return new Promise(function (resolve, reject) {
//             DataStore.db().getInstance().then(function (db) {
//                 var request = db.transaction(DB.tbl.assessmentEvent, DB.transactionMode.readwrite)
//                     .objectStore(DB.tbl.assessmentEvent)
//                     .getAll();
//                 request.onsuccess = function (event) {
//                     var assessmentEvents = event.target.result;
//                     var matchingAttempt;
//                     sessionCode = sessionCode.replace(/-/g, '');
//                     oneTimeCode = oneTimeCode.replace(/-/g, '');
//                     _.each(assessmentEvents, function (ae) {
//                         _.each(ae, function (attempt) {
//                             if (attempt.sessionCode == sessionCode && attempt.oneTimeCode == oneTimeCode) {
//                                 matchingAttempt = attempt;
//                                 return false;
//                             }
//                         });
//                         if (matchingAttempt) {
//                             return false;
//                         }
//                     });
//                     if (matchingAttempt) {
//                         resolve(matchingAttempt);
//                     }
//                     else {
//                         reject();
//                     }
//                 };
//                 request.onerror = function (event) {
//                     reject();
//                 };
//             });
//         });
//     };
//     DataStore.getTestPlayerContext = function (attemptId) {
//         return new Promise(function (resolve, reject) {
//             DataStore.db().getInstance().then(function (db) {
//                 var request = db.transaction(DB.tbl.testPlayerContext, DB.transactionMode.readwrite)
//                     .objectStore(DB.tbl.testPlayerContext)
//                     .get(attemptId);
//                 request.onsuccess = function (event) {
//                     var context = event.target.result;
//                     if (context) {
//                         tpContext = context;
//                         resolve(context);
//                     }
//                     else {
//                         reject(new Error('failed to get test player context'));
//                     }
//                 };
//                 request.onerror = function (event) {
//                     reject(new Error('failed to get test player context'));
//                 };
//             });
//         });
//     };
//     DataStore.getTestDefinition = function () {
//         return new Promise(function (resolve, reject) {
//             DataStore.db().getInstance().then(function (db) {
//                 var request = db.transaction(DB.tbl.testDefinition, DB.transactionMode.readwrite)
//                     .objectStore(DB.tbl.testDefinition)
//                     .get(tpContext.attempt.id);
//                 request.onsuccess = function (event) {
//                     var testDef = event.target.result;
//                     if (testDef) {
//                         testDefinition = testDef;
//                         resolve(testDefinition);
//                     }
//                     else {
//                         reject(new Error('failed to get test definition'));
//                     }
//                 };
//                 request.onerror = function (event) {
//                     reject(new Error('failed to get test definition'));
//                 };
//             });
//         });
//     };
//     DataStore.persistTestPlayerContext = function () {
//         return DataStore.db().dbPut('store test player context', DB.tbl.testPlayerContext, tpContext);
//     };
//     DataStore.persistTestDefinition = function () {
//         return DataStore.db().dbPut('store test definition', DB.tbl.testDefinition, testDefinition);
//     };
//     DataStore.persistAssessmentEventData = function (data) {
//         return DataStore.db().dbPut('store assessment event data', DB.tbl.assessmentEvent, data);
//     };
//     DataStore.persistNavState = function () {
//         return DataStore.db().dbPut('store navState', DB.tbl.navState, navStateResponse);
//     };
//     DataStore.persistAnswer = function (answer) {
//         return DataStore.db().dbPatch('save answer', DB.tbl.attemptAnswers, answer.attemptId, function (existingRecord) {
//             var answersRecord = existingRecord || { attemptId: answer.attemptId, answers: [] };
//             var storedAnswer = _.clone(answer);
//             var storedAnswerIndex = _.findIndex(answersRecord.answers, function (a) { return a.questionId == answer.questionId && a.sectionId == answer.sectionId; });
//             if (storedAnswerIndex == -1) {
//                 storedAnswer.timestamp = new Date().toJSON(); // for answers use the earliest timestamp
//                 answersRecord.answers.push(storedAnswer);
//             }
//             else {
//                 answersRecord.answers[storedAnswerIndex] = storedAnswer;
//             }
//             return answersRecord;
//         });
//     };
//     DataStore.persistCompletedSection = function (completedSection) {
//         return DataStore.db().dbPatch('save completed section', DB.tbl.completedSections, completedSection.attemptId, function (existingRecord) {
//             var sectionsRecord = existingRecord || { attemptId: completedSection.attemptId, completedSections: [] };
//             var storedSection = _.clone(completedSection);
//             storedSection.timestamp = new Date().toJSON(); // for completed sections use the latest timestamp
//             var storedSectionIndex = _.findIndex(sectionsRecord.completedSections, function (s) { return s.sectionId == completedSection.sectionId; });
//             if (storedSectionIndex == -1) {
//                 sectionsRecord.completedSections.push(storedSection);
//             }
//             else {
//                 sectionsRecord.completedSections[storedSectionIndex] = storedSection;
//             }
//             return sectionsRecord;
//         });
//     };
//     DataStore.persistFileUpload = function (attemptId, questionId, contentType, arrayBuffer) {
//         return DataStore.db().dbPatch('save file upload', DB.tbl.fileUploads, attemptId, function (existingRecord) {
//             var fileUploadRecord = existingRecord || { attemptId: attemptId, uploads: [] };
//             fileUploadRecord.uploads.push({ questionId: questionId, contentType: contentType, arrayBuffer: arrayBuffer });
//             return fileUploadRecord;
//         });
//     };
//     DataStore.persistDisruption = function (request) {
//         return DataStore.db().dbPatch('save disruption', DB.tbl.disruptions, request.attemptId, function (existingRecord) {
//             var attemptDisruptions = existingRecord || { attemptId: request.attemptId, disruption: [] };
//             attemptDisruptions.disruption.push(request);
//             return attemptDisruptions;
//         });
//     };
//     return DataStore;
// }());
// //#endregion
// //#region Service Worker
// DB.open();
var CACHE_VERSION = 1;
var RTP_CACHE_NAME = 'RTP.v' + CACHE_VERSION;
// var emptyResponse = 'null';
// var tp2_debug = [];
// var tpContext;
// var testDefinition;
// var testDependencyCount = 0;
// var testDependencyCachedCount = 0;
// var attemptStatusResponse = {
//     attemptStatus: {
//         isStarted: false,
//         isTakenAway: false,
//         state: TestPlayer.Models.AttemptState.Active,
//         status: TestPlayer.Models.AttemptStatus.open
//     }
// };
// var navStateResponse = {
//     attemptId: null,
//     state: {
//         questionId: null,
//         sectionId: null,
//         isSummary: false
//     }
// };
// function getQuery(name, url) {
//     return url.searchParams.get(name);
// }
// function getSection(id) {
//     return _.find(testDefinition.sections, function (section) { return section.id == id; });
// }
// function getQuestionStats(id) {
//     return _(testDefinition.sections).selectMany(function (section) { return section.questions; }).find(function (question) { return question.id === id; });
// }
// function getQuestion(id) {
//     return _.find(testDefinition.questions, function (question) { return question.id === id; });
// }
// function linkQuestionsAndStats() {
//     testDefinition.sections.forEach(function (section) {
//         for (var i = 0; i < section.questions.length; i++) {
//             var stats = section.questions[i];
//             var question = getQuestion(stats.id);
//             section.questions[i] = question.stats;
//             question.stats.id = stats.id;
//         }
//     });
// }
worker.addEventListener('error', function (event) {
    //TODO tidy
    console.error(event.error);
    console.error("Error in " + event.filename + " : (" + event.lineno + ", " + event.colno + ") - " + event.message);
    console.error("Error @ " + event.error.stack);
});
worker.addEventListener('message', function (event) {
    console.log("worker.addEventListener('message') - action: " + event.data.action + ", event:", event);
    switch (event.data.action) {
        // case 'tpContext:set':
        //     tpContext = event.data.cacheContext;
        //     event.ports[0].postMessage({ action: 'tpContext:ready' });
        //     break;
        // case 'install:debug':
        //     caches.open(RTP_CACHE_NAME).then(function (cache) {
        //         cache.addAll(getDebugResources()).then(function () {
        //             event.ports[0].postMessage({ action: 'install:debug:done' });
        //         }, function (err) {
        //             event.ports[0].postMessage({ action: 'install:debug:error', error: err });
        //         });
        //     });
        //     break;
        // case 'prepare:device:progress':
        //     var progress = testDependencyCount > 0
        //         ? testDependencyCachedCount / testDependencyCount * 100
        //         : 0;
        //     event.ports[0].postMessage({ action: 'prepare:device:progress', progress: progress });
        //     break;
        // case 'prepare:device':
        //     testDependencyCount = 0;
        //     testDependencyCachedCount = 0;
        //     var data_1 = event.data;
        //     var stats_1 = {
        //         attemptCount: 0,
        //         prepRequestDuration: 0,
        //         dependencyRequestDuration: 0,
        //         testname: '',
        //         sessionCode: ''
        //     };
        //     var prepStartedAt_1 = Date.now();
        //     var promises = [
        //         fetch(data_1.prepUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } }).then(function (response) {
        //             return response.json().then(function (prepData) {
        //                 if (prepData.length) {
        //                     stats_1.testname = prepData[0].context.displayName;
        //                     stats_1.sessionCode = prepData[0].sessionCode;
        //                 }
        //                 stats_1.attemptCount = prepData.length;
        //                 stats_1.prepRequestDuration = Date.now() - prepStartedAt_1;
        //                 var dependenciesStartedAt = Date.now();
        //                 return DataStore.persistAssessmentEventData(prepData).then(function () {
        //                     return downloadTestDependencies(_.map(prepData, function (attempt) { return attempt.testDefinition; })).then(function () {
        //                         stats_1.dependencyRequestDuration = Date.now() - dependenciesStartedAt;
        //                     });
        //                 });
        //             });
        //         }),
        //         caches.open(RTP_CACHE_NAME).then(function (cache) { return cache.addAll(data_1.cacheUrls); })
        //     ];
        //     Promise.all(promises)
        //         .then(function () {
        //         event.ports[0].postMessage({ action: 'prepare:device:done', stats: stats_1 });
        //     })
        //         .catch(function (err) {
        //         event.ports[0].postMessage({ action: 'prepare:device:failed', error: err });
        //     });
        //     break;
        default:
            throw new Error("Unhandled message; action: " + event.data.action + " - data: " + JSON.stringify(event.data));
    }
});
worker.addEventListener('install', function (event) {
    console.log("worker.addEventListener('install')");
    //TODO support CDN hosted resources
    var tp2Resources = getTP2StaticResources();
    // var mathjaxResources = getMathJaxResources();
    event.waitUntil(worker.skipWaiting().then(function () { return caches
        .open(RTP_CACHE_NAME)
        .then(function (cache) { return cache
        .addAll(tp2Resources)
        //.then(function () { return cache.add(mathjaxResources.shift())
        //.then(function () { return cache.addAll(mathjaxResources); })
        //.catch(function () { console.warn('Unable to prefetch mathjax.'); }); }); })
        .catch(function (err) {
        console.log('Failed to install SW!');
        console.log('cache.addAll error:', err);
        //Extreme debugging
        console.log("re-fetching everything (" + tp2Resources.length + " files):");
        var count = 0;
        return Promise.all(tp2Resources.map(function (url) {
            return fetch(url)
                .then(function (response) {
                if (response.ok) {
                    console.log(count++, 'url', url, response.statusText);
                    count++;
                }
                else {
                    console.error(count++, 'Fetch failed:', url, err);
                }
            })
                .catch(function (err) {
                console.error(count++, 'Fetch failed:', url, err);
            });
        }))
            .then(function () { return Promise.reject(err); });
    })
        .then(function () {
        console.log('Installed and ready to go!');
    }); }));
});
worker.addEventListener('activate', function (event) {
    console.log("worker.addEventListener('activate')");
    if (DEBUG_ENABLED) {
        console.warn('rtpServiceWorker:debug enabled');
    }
    //TODO test if this is more reliable and preferable to refreshing
    //maybe refreshing isnt even necessary, if we install the ServiceWorker external to the TestPlayer
    event.waitUntil(worker.clients.claim().then(function () {
        console.log('SW clients claimed!');
    }));
});
worker.addEventListener('fetch', function (event) {
    console.log("worker.addEventListener('fetch')");
    var info = {
        event: event,
        url: new URL(event.request.url),
        requestUrl: event.request.url
    };
    //Prevent the service worker from handling itsself, this was causing the SW to crash when requesting it
    if (info.requestUrl === location.href) {
        console.log('Skipping fetch event for', info.url);
        return;
    }
    //Prevent the service worker from intercepting scripts for browser extensions (TODO firefox?)
    if (info.url.protocol === 'chrome-extension:') {
        return;
    }
    var handlers = [handleAttemptAPI, authAPIHandler, playerPageHandler];
    if (_.any(handlers, function (handle) { return handle(info); })) {
        return;
    }
    if (event.request.method === 'POST') {
        //TODO store in IndexDB, caches do not accept posts
        return;
    }
    var fromCache = false;
    var fetchErr;
    //TODO dont cache CLS pages
    event.respondWith(caches.open(RTP_CACHE_NAME).then(function (cache) {
        function networkRequest() {
            return fetch(event.request)
                .then(function (response) {
                //console.log('cache updated');
                cache.put(event.request, response.clone());
                tp2_debug.push(event.request.url);
                tp2_debug = _.uniq(tp2_debug).sort();
                return response;
            })
                .catch(function () { return cache.match(event.request); });
        }
        return cache.match(event.request)
            .then(function (response) {
            if (response) {
                //Try to update from network for next request
                console.log('cache hit');
                if (navigator.onLine) {
                    networkRequest();
                }
                return response;
            }
            console.log('cache miss');
            return networkRequest();
        });
    }));
});
var IS_OFFLINE = false;
// function handleEndpoints(baseUrl, handle, onBeforeResponse) {
//     return function (info) {
//         function isEndpoint(endpoint) {
//             return info.requestUrl.indexOf(baseUrl + endpoint) > 0;
//         }
//         function json(obj) {
//             var value = !obj ? Promise.resolve(null) : obj.then ? obj : Promise.resolve(obj);
//             var jsonResponse = function (valuePromise) {
//                 info.event.respondWith(valuePromise.then(function (val) {
//                     if (val instanceof Response) {
//                         return val;
//                     }
//                     return Promise.resolve(new Response(JSON.stringify(val), headers));
//                 }));
//                 return true;
//             };
//             var headers = { headers: { 'Content-Type': 'application/json' }, status: 200, statusText: 'OK' };
//             if (onBeforeResponse) {
//                 onBeforeResponse();
//             }
//             return jsonResponse(value);
//         }
//         function html(html) {
//             var value = html.then ? html : Promise.resolve(html);
//             var htmlResponse = function (valuePromise) {
//                 info.event.respondWith(valuePromise.then(function (val) {
//                     if (val instanceof Response) {
//                         return val;
//                     }
//                     return Promise.resolve(new Response(val, headers));
//                 }));
//                 return true;
//             };
//             var headers = { headers: { 'Content-Type': 'text/html' }, status: 200, statusText: 'OK' };
//             if (onBeforeResponse) {
//                 onBeforeResponse();
//             }
//             return htmlResponse(value);
//         }
//         var respondWith = {
//             json: json,
//             html: html
//         };
//         return handle(info, isEndpoint, respondWith);
//     };
// }
// function handleAttemptAPI(info) {
//     function isEndpoint(endpoint) {
//         return info.requestUrl.indexOf(tpContext.urls.api + endpoint) > 0;
//     }
//     function json(obj) {
//         var value = obj.then ? obj : Promise.resolve(obj);
//         var jsonResponse = function (valuePromise) {
//             info.event.respondWith(valuePromise.then(function (val) {
//                 if (val instanceof Response) {
//                     return val;
//                 }
//                 return Promise.resolve(new Response(JSON.stringify(val), headers));
//             }));
//             return true;
//         };
//         var headers = { headers: { 'Content-Type': 'application/json' }, status: 200, statusText: 'OK' };
//         if (isEndpoint('attemptStatus') || isEndpoint('attemptSummary')) {
//             //AttemptStatus is always network first, offline fallback
//             //To support to possibility of invigilation at all times.
//             //But as for posting answers on reconnecting to the internet, 
//             //we would rather depend on full reconciliation for best results
//             return jsonResponse(fetch(info.event.request).catch(function () {
//                 console.log('Unable to connect to online CLS. Invigiliation currently unavailable.');
//                 return value;
//             }));
//         }
//         var networkRequest = function () {
//             if (IS_OFFLINE) {
//                 return Promise.resolve(null);
//             }
//             return fetch(info.event.request).catch(function (result) {
//                 console.warn("Going OFFLINE - failed to make HTTP request: " + info.requestUrl, result);
//                 IS_OFFLINE = true;
//             });
//         };
//         //It doesnt matter when the network request finishes, 
//         //we just want to make sure the requests go out
//         networkRequest();
//         return jsonResponse(value);
//     }
//     if (tpContext) {
//         if (isEndpoint('testDefinition')) {
//             return json(getTestDefinition(info));
//         }
//     }
//     if (tpContext && testDefinition) {
//         var sectionId = getQuery('sectionId', info.url);
//         var questionId = getQuery('questionId', info.url);
//         if (isEndpoint('question')) {
//             var question = getQuestion(questionId);
//             return json(question);
//         }
//         if (isEndpoint('answer')) {
//             return json(info.event.request.clone().json()
//                 .then(function (setAnswerModel) {
//                 return DataStore.persistAnswer(setAnswerModel).then(function () {
//                     var question = getQuestion(setAnswerModel.questionId);
//                     if (setAnswerModel.isFlagged != null) {
//                         question.stats.isFlagged = setAnswerModel.isFlagged;
//                     }
//                     if (setAnswerModel.answers) {
//                         setAnswerModel.answers.forEach(function (answerModel) {
//                             question.stats.isAnswered = question.stats.isAnswered || answerModel.isAnswered;
//                             answerModel.answers.forEach(function (part) {
//                                 question.interactions.forEach(function (interaction) {
//                                     if (interaction.id === part.partId) {
//                                         interaction.answer = part.valueText;
//                                     }
//                                 });
//                             });
//                         });
//                     }
//                     var section = getSection(setAnswerModel.sectionId);
//                     section.numberQuestionsAnswered = _.countBy(section.questions, function (q) { return q.isAnswered; }).true;
//                     section.numberQuestionsFlagged = _.countBy(section.questions, function (q) { return q.isFlagged; }).true;
//                     section.numberQuestionsVisited = _.countBy(section.questions, function (q) { return q.isVisited; }).true;
//                 })
//                     .then(function () { return DataStore.persistTestDefinition(); })
//                     .then(function () { return attemptStatusResponse; });
//             }));
//         }
//         if (isEndpoint('attemptSummary')) {
//             return json(testDefinition);
//         }
//         if (isEndpoint('attemptStatus')) {
//             return json(attemptStatusResponse);
//         }
//         if (isEndpoint('disruption')) {
//             return json(info.event.request.clone().json()
//                 .then(function (json) {
//                 return DataStore.persistDisruption(json);
//             })
//                 .then(function () { return emptyResponse; }));
//         }
//         if (isEndpoint('section')) {
//             return json(getSection(sectionId));
//         }
//         if (isEndpoint('completeAttempt')) {
//             attemptStatusResponse.attemptStatus.status = TestPlayer.Models.AttemptStatus.completed;
//             return json(attemptStatusResponse);
//         }
//         if (isEndpoint('reopenAttempt')) {
//             attemptStatusResponse.attemptStatus.status = TestPlayer.Models.AttemptStatus.open;
//             return json(attemptStatusResponse);
//         }
//         if (isEndpoint('completeSection')) {
//             return json(info.event.request.clone().json()
//                 .then(function (completeSectionModel) {
//                 return DataStore.persistCompletedSection(completeSectionModel)
//                     .then(function () { return attemptStatusResponse; });
//             }));
//         }
//         if (isEndpoint('navState')) {
//             if (info.event.request.method === 'POST') {
//                 return json(info.event.request.clone().json()
//                     .then(function (setNavModel) {
//                     navStateResponse.attemptId = setNavModel.attemptId;
//                     navStateResponse.state.isSummary = setNavModel.state.isSummary;
//                     navStateResponse.state.questionId = setNavModel.state.questionId
//                         ? setNavModel.state.questionId
//                         : navStateResponse.state.questionId;
//                     navStateResponse.state.sectionId = setNavModel.state.sectionId
//                         ? setNavModel.state.sectionId
//                         : navStateResponse.state.sectionId;
//                     testDefinition.attemptStatus.isStarted = true;
//                     if (navStateResponse.state.questionId && navStateResponse.state.sectionId) {
//                         var question_1 = getQuestion(navStateResponse.state.questionId);
//                         question_1.stats.isVisited = true;
//                         var section = getSection(navStateResponse.state.sectionId);
//                         section.numberQuestionsVisited = _.countBy(section.questions, function (q) { return q.isVisited; }).true;
//                     }
//                 })
//                     .then(function () { return DataStore.persistNavState(); })
//                     .then(function () { return DataStore.persistTestDefinition(); })
//                     .then(function () { return emptyResponse; }));
//             }
//             else {
//                 return json(navStateResponse.state);
//             }
//         }
//         if (isEndpoint('evaluateAnswers')) {
//             return json({ answers: [] });
//         }
//         if (isEndpoint('getpnptypes')) {
//             return json({ "items": [], "more": false });
//         }
//         if (isEndpoint('notifyReadyToStart')) {
//             return json(emptyResponse);
//         }
//         if (isEndpoint('uploadFile')) {
//             // Unfortunately, Request.formData() is not supported in any browsers atm 
//             var contentType_1 = info.event.request.headers.get('Content-Type');
//             return json(info.event.request.clone().arrayBuffer()
//                 .then(function (arrayBuffer) {
//                 var attemptId = info.url.searchParams.get('attemptId');
//                 var questionId = info.url.searchParams.get('questionId');
//                 DataStore.persistFileUpload(attemptId, questionId, contentType_1, arrayBuffer)
//                     .then(function () { return attemptStatusResponse; });
//             }));
//         }
//     }
// }
// var authAPIHandler = handleEndpoints('/auth/', function (info, isEndpoint, respondWith) {
//     if (isEndpoint('onetimecodelogin') || isEndpoint('accesscodelogin')) {
//         function fromNetwork() {
//             return fetch(info.event.request.clone()).then(function (response) {
//                 //Prime the cache (with the prepared test definition) and return the response from the network request
//                 //This is necessary, just in case the attempt is locked and only a partial test definition is returned.
//                 return fromCache().then(function () { return response; });
//             });
//         }
//         function fromCache() {
//             return info.event.request.clone().json().then(function (data) {
//                 return DataStore.isPrepared().then(function (isPrepared) {
//                     if (!isPrepared) {
//                         return {
//                             isSuccess: false,
//                             errorMessage: "This device is not prepared for taking the test offline.",
//                         };
//                     }
//                     if (data.sessionCode && data.oneTimeCode) {
//                         return DataStore.getTestDefinitionByOTC(data.sessionCode, data.oneTimeCode).then(function (attempt) {
//                             if (data.isConfirmation) {
//                                 tpContext = attempt.context;
//                                 testDefinition = attempt.testDefinition;
//                                 return DataStore.persistTestPlayerContext()
//                                     .then(function () { return DataStore.persistTestDefinition(); })
//                                     .then(function () {
//                                     var attemptId = attempt.context.attempt.id;
//                                     var redirectTo = isEndpoint('onetimecodelogin')
//                                         ? "/testplayer2/testplayer/onetimecode?id=" + attemptId
//                                         : "/testplayer2/testplayer/dashboard/" + attemptId;
//                                     return {
//                                         isSuccess: true,
//                                         redirectTo: "/testplayer2/testplayer/onetimecode?id=" + attemptId
//                                     };
//                                 });
//                             }
//                             else {
//                                 var testName = attempt.context.displayName;
//                                 var userFullName = attempt.context.user.fullName;
//                                 return {
//                                     isSuccess: true,
//                                     testName: testName,
//                                     userFullName: userFullName
//                                 };
//                             }
//                         }, function () {
//                             return {
//                                 isSuccess: false,
//                                 errorMessage: "Incorrect session code and/or one time code.",
//                             };
//                         });
//                     }
//                     else if (data.sessionCode) {
//                         return {
//                             isSuccess: false,
//                             errorMessage: "One Time Code not specified",
//                         };
//                     }
//                     else {
//                         return {
//                             isSuccess: false,
//                             errorMessage: "Session code and One Time Code are both required.",
//                         };
//                     }
//                 });
//             });
//         }
//         //Network first
//         return respondWith.json(fromNetwork().catch(fromCache));
//     }
//     return false;
// });
// var playerPageHandler = handleEndpoints('/testplayer2/testplayer/', function (info, isEndpoint, respondWith) {
//     if (isEndpoint('onetimecode') || isEndpoint('exam')) {
//         //get the blank player html and rewrite it to include the prepared test player context
//         //TODO handle when we're using reliable mode, without preparation (i.e. no blankplayer in cache)
//         function fromNetwork() {
//             return fetch(info.event.request);
//         }
//         function fromCache() {
//             var attemptId = new URL(info.requestUrl).searchParams.get('id');
//             var tpContextPattern = /APP.constant\('testPlayerContext', (.*)\);/;
//             var tpContextValue = function () { return "APP.constant('testPlayerContext', " + JSON.stringify(tpContext) + ");"; };
//             var rewriteHtml = function (text) {
//                 return text.replace(tpContextPattern, tpContextValue());
//             };
//             var urlSplitter = '/' + new URL(info.requestUrl).pathname.split('/').pop(); // either /onetimecode or /exam
//             return DataStore.getTestPlayerContext(attemptId)
//                 .then(function () { return DataStore.getTestDefinition(); })
//                 .then(function () { return caches.open(RTP_CACHE_NAME); })
//                 .then(function (cache) { return cache.match(info.requestUrl.split(urlSplitter)[0] + '/blankplayer'); })
//                 .then(function (response) { return response.clone().text(); })
//                 .then(rewriteHtml);
//         }
//         //Network first
//         return respondWith.html(fromNetwork().catch(function () { return fromCache().catch(function (err) { return "\n                <h1>Offline</h1>\n                <p>This device is not prepared for taking the test offline.</p>\n                <p>ERR: " + err + "</p>\n            "; }); }));
//     }
//     return false;
// });
// function getTestDefinition(info) {
//     console.log('Extracting test definition');
//     return getFromDB()
//         .catch(function () { return getFromNetwork(); })
//         .then(function () { return downloadTestDependencies(testDefinition); })
//         .then(function () {
//         linkQuestionsAndStats();
//         return testDefinition;
//     });
//     function getFromDB() {
//         return DataStore.getTestDefinition();
//     }
//     function getFromNetwork() {
//         return new Promise(function (resolve, reject) {
//             //Go get the test definition from the network, and fetch all of its dependencies
//             fetch(info.event.request).then(function (response) {
//                 return response.clone().json()
//                     .then(function (testDef) {
//                     testDefinition = testDef;
//                 })
//                     .then(function () { return DataStore.persistTestDefinition(); });
//             })
//                 .catch(function (err) { return reject(err); });
//         });
//     }
// }
// function downloadTestDependencies(testDef) {
//     var dependencyUrls = [];
//     var srcPattern = /(?:src|href)=['"]([^'"])['"]/g;
//     function scan(deps) {
//         if (deps == null || deps.length === 0)
//             return;
//         deps.forEach(function (dep) {
//             if (deps == null || deps.length == 0) {
//                 return;
//             }
//             if (dep.url) {
//                 dependencyUrls.push(dep.url);
//             }
//             if (dep.metadata.html) {
//                 var match = void 0;
//                 while (match = srcPattern.exec(dep.metadata.html)) {
//                     dependencyUrls.push(match[1]);
//                 }
//             }
//             if (dep.dependencies && dep.dependencies.length) {
//                 scan(dep.dependencies);
//             }
//         });
//     }
//     //collect all urls to resources that need to be downloaded
//     var testDefs = _.isArray(testDef)
//         ? testDef
//         : [testDef];
//     _.each(testDefs, function (testDef) { return testDef.questions.forEach(function (question) { return scan(question.dependencies); }); });
//     dependencyUrls = _.uniq(dependencyUrls);
//     testDependencyCount = dependencyUrls.length;
//     //TODO maybe scan stimuli and question stem/prompts for external links to cache
//     //Same origin policy applies, so we may not be able to cache files that are hosted in CDN :s
//     //Need to check if current CORS settings is supportive of offline caching
//     return caches.open(RTP_CACHE_NAME)
//         .then(function (cache) {
//         return Promise
//             .all(dependencyUrls.map(function (url, i) { return cache.match(url).then(function (match) {
//             if (match) {
//                 return i;
//             }
//             return null;
//         }); }))
//             .then(function (cachedIndex) {
//             //filter out the resources that are already cached
//             cachedIndex.forEach(function (index) {
//                 if (index != null) {
//                     dependencyUrls[index] = null;
//                 }
//             });
//             //fetch all un-cached resources
//             var uncachedUrls = _.compact(dependencyUrls);
//             testDependencyCount = uncachedUrls.length;
//             if (_.any(uncachedUrls)) {
//                 return Promise.all(uncachedUrls.map(function (url) { return cache.add(url).then(function () { testDependencyCachedCount++; }); }));
//             }
//         });
//     })
//         .catch(function (err) {
//         console.error('Failed to fetch all of the test\'s necessary dependencies to run offline. error:', err);
//         dependencyUrls.forEach(function (url) { return console.log(url); });
//     });
// }
// //TODO generate these resource lists with bundler where possible, and store them separately to the service worker (use fetch).
function getTP2StaticResources() {
    return [
        // //Get root page
        // //'/tp2.html',
        // //Get i18n
        // //'/RTP/i18n/strings.json',
        // //Get custom styling
        // //TODO theme file names need to be handled as it is not predictable
        // //'/RTP/theme/logo.png',
        // //'/RTP/theme/override.687eda2b-be0a-e711-80c1-00155d533749.css',
        // //'/RTP/theme/tp2.colours.687eda2b-be0a-e711-80c1-00155d533749.css',
        // //'/RTP/skin/override-testplayer.css',
        // //'/common/tools/GetAllResources/en-AU-1.0.0.0-635978540574430000?require=TestPlayer2.i18n&require=TestPlayer2.i18n.Preview',
        // //'/janison.objects/global/Skin/override-testplayer.css?18-6-19-50',
        // //Get bundles
        // '/app/tp2.min.css',
        // '/app/tp2.min.js',
        // //worker imports
        // '/scripts/lodash.js',
        // '/scripts/lodashEx.js',
        // '/app/blocks/utils/enum-extensions.js',
        // '/app/testplayer/models/AttemptState.js',
        // '/app/testplayer/models/AttemptStatus.js',
        // //Get all TP2 images
        // '/app/testplayer/attempt-summary/flag-1x.png',
        // '/app/testplayer/attempt-summary/flag-2x.png',
        // '/app/testplayer/attempt-summary/flag-legend-1x.png',
        // '/app/testplayer/attempt-summary/flag-legend-2x.png',
        // '/app/testplayer/attempt-summary/lock-sm-1x.png',
        // '/app/testplayer/attempt-summary/lock-sm-2x.png',
        // '/app/testplayer/attempt-summary/lock-sm-alt-1x.png',
        // '/app/testplayer/attempt-summary/lock-sm-alt-2x.png',
        // '/app/testplayer/modal/end-of-section/lock-1x.png',
        // '/app/testplayer/modal/end-of-section/lock-2x.png',
        // '/app/testplayer/modal/waiting/waiting-1x.png',
        // '/app/testplayer/modal/waiting/waiting-2x.png',
        // '/app/testplayer/navigation/linear-nav-buttons/flag-1x.png',
        // '/app/testplayer/navigation/linear-nav-buttons/flag-2x.png',
        // '/app/testplayer/questions/associate/bin-dark.png',
        // '/app/testplayer/questions/associate/bin-dark-x2.png',
        // '/app/testplayer/timer/timer-hidden-1x.png',
        // '/app/testplayer/timer/timer-hidden-2x.png',
        // '/app/testplayer/tools/audio/audio-close-1x.png',
        // '/app/testplayer/tools/audio/audio-close-2x.png',
        // '/app/testplayer/tools/audio/audio-open-1x.png',
        // '/app/testplayer/tools/audio/audio-open-2x.png',
        // '/app/testplayer/tools/audio/question-audio-1x.png',
        // '/app/testplayer/tools/audio/question-audio-2x.png',
        // '/app/testplayer/tools/audio/stimulus-audio-1x.png',
        // '/app/testplayer/tools/audio/stimulus-audio-2x.png',
        // '/app/testplayer/tools/protractor/protractor-tool-1x.png',
        // '/app/testplayer/tools/protractor/protractor-tool-2x.png',
        '/images/ruler-tool-2x.png',
        '/images/ruler-tool-1x.png'
    ];
}
// function getMathJaxResources() {
//     return [
//         //Get as many common mathjax files as is practical
//         '/mathjax/MathJax.js',
//         '/mathjax/mathjax.min.js',
//         //All mathjax scripts that were loaded as a result of rendering the stress test
//         '/mathjax/extensions/mml2jax.js?rev=2.6.1,',
//         '/mathjax/extensions/tex2jax.js?rev=2.6.1',
//         '/mathjax/extensions/MathEvents.js?rev=2.6.1',
//         '/mathjax/extensions/MathML/content-mathml.js?rev=2.6.1',
//         '/mathjax/jax/input/MathML/config.js?rev=2.6.1',
//         '/mathjax/jax/input/TeX/config.js?rev=2.6.1',
//         '/mathjax/jax/input/MathML/jax.js?rev=2.6.1',
//         '/mathjax/jax/element/mml/jax.js?rev=2.6.1',
//         '/mathjax/jax/element/mml/optable/BasicLatin.js?rev=2.6.1',
//         '/mathjax/jax/element/mml/optable/MathOperators.js?rev=2.6.1',
//         '/mathjax/jax/element/mml/optable/GeneralPunctuation.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/config.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/jax.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/autoload/mtable.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/autoload/mmultiscripts.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/fontdata.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/AMS/Regular/Main.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/AMS/Regular/MiscTechnical.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/AMS/Regular/GeneralPunctuation.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/AMS/Regular/MathOperators.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Size1/Regular/Main.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Size2/Regular/Main.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Size3/Regular/Main.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Size4/Regular/Main.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Main/Regular/LetterlikeSymbols.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Main/Regular/MathOperators.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Main/Regular/BasicLatin.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Main/Italic/Main.js?rev=2.6.1',
//         '/mathjax/jax/output/SVG/fonts/TeX/Main/Italic/LetterlikeSymbols.js?rev=2.6.1'
//     ];
// }
// function getDebugResources() {
//     return [
//         '/Content/css/CodeMirror/codemirror.css',
//         '/Content/css/font_awesome/font-awesome.css',
//         '/Content/css/hotkeys.css',
//         '/Scripts/CodeMirror/lib/codemirror.js',
//         '/Scripts/angular-1.4.6/angular-route.js',
//         '/Scripts/angular-1.4.6/angular.js',
//         '/Scripts/angular-injector.js',
//         '/Scripts/angular-ui/ui-bootstrap-modal.js',
//         '/Scripts/app/config/postal.js',
//         '/Scripts/app/config/safeApply.js',
//         '/Scripts/app/directives/juiInclude.js',
//         '/Scripts/app/filters/ignoreDecimalZeros.js',
//         '/Scripts/app/filters/truncate.js',
//         '/Scripts/app/services/SyncQueue.js',
//         '/Scripts/app/services/hotkeys.js',
//         '/Scripts/app/services/insertHtmlAndRegisterNewServices.js',
//         '/Scripts/app/services/localize.js',
//         '/Scripts/app/services/rpc.js',
//         '/Scripts/i18n/angular-locale_en-au.min.js',
//         '/Scripts/jquery-1.11.3.js',
//         '/Scripts/cycle.js',
//         '/Scripts/lodash.js',
//         '/Scripts/lodashEx.js',
//         '/Scripts/moment.js',
//         '/Scripts/moment/en-au.min.js',
//         '/Scripts/mousetrap.js',
//         '/Scripts/postal.js',
//         '/Scripts/truncate.js',
//         '/Scripts/typescript-helpers.js',
//         '/Scripts/utils.js',
//         '/app/blocks/exception/exception.module.js',
//         '/app/blocks/exception/exceptionHandler.js',
//         '/app/blocks/filters/filters.module.js',
//         '/app/blocks/filters/padFilter.js',
//         '/app/blocks/logger/logger.module.js',
//         '/app/blocks/router/router.module.js',
//         '/app/blocks/services/objectCacheFactory.js',
//         '/app/blocks/services/pollingService.js',
//         '/app/blocks/services/services.module.js',
//         '/app/blocks/svg/line.js',
//         '/app/blocks/svg/svg.module.js',
//         '/app/blocks/ui/ui-tinymce.js',
//         '/app/blocks/ui/ui.module.js',
//         '/app/blocks/utils/bind-compiled-html.js',
//         '/app/blocks/utils/enum-extensions.js',
//         '/app/blocks/utils/mathMl.css',
//         '/app/blocks/utils/mathMl.js',
//         '/app/blocks/utils/utils.module.js',
//         '/app/content/animations/ng-view.css',
//         '/app/content/mdl/mdl-spinner.css',
//         '/app/content/sticky-footer.css',
//         '/app/content/testPlayer.css',
//         '/app/content/testPlayer.loading.css',
//         '/app/decorators/angular/decorators/component/require.js',
//         '/app/decorators/angular/decorators/component/transclude.js',
//         '/app/decorators/angular/decorators/component/view.js',
//         '/app/decorators/angular/decorators/inject.js',
//         '/app/decorators/angular/decorators/injectable.js',
//         '/app/decorators/angular/decorators/providers/animation.js',
//         '/app/decorators/angular/decorators/providers/component.js',
//         '/app/decorators/angular/decorators/providers/controller.js',
//         '/app/decorators/angular/decorators/providers/directive.js',
//         '/app/decorators/angular/decorators/providers/factory.js',
//         '/app/decorators/angular/decorators/providers/filter.js',
//         '/app/decorators/angular/decorators/providers/provider.js',
//         '/app/decorators/angular/decorators/providers/route.js',
//         '/app/decorators/angular/decorators/providers/service.js',
//         '/app/decorators/angular/index.js',
//         '/app/decorators/angular/module.js',
//         '/app/decorators/angular/util/decorate-directive.js',
//         '/app/decorators/angular/util/decorate.js',
//         '/app/decorators/angular/util/decorator-factory.js',
//         '/app/decorators/angular/util/parse-properties.js',
//         '/app/decorators/angular/util/parse-selector.js',
//         '/app/decorators/angular/writers.js',
//         '/app/testplayer/animation/animate-on-change.js',
//         '/app/testplayer/animation/animate-on-delay.js',
//         '/app/testplayer/animation/animate.js',
//         '/app/testplayer/animation/animation.module.js',
//         '/app/testplayer/animation/animations.js',
//         '/app/testplayer/attempt-summary/attempt-summary.css',
//         '/app/testplayer/attempt-summary/attempt-summary.html',
//         '/app/testplayer/attempt-summary/attempt-summary.js',
//         '/app/testplayer/attempt-summary/attempt-summary.module.js',
//         '/app/testplayer/attempt-summary/attempt-summary.route.js',
//         '/app/testplayer/attempt-summary/candidate-name.js',
//         '/app/testplayer/attempt-summary/flag-1x.png',
//         '/app/testplayer/attempt-summary/flag-legend-1x.png',
//         '/app/testplayer/bounce-arrow/bounce-arrow.css',
//         '/app/testplayer/bounce-arrow/bounce-arrow.html',
//         '/app/testplayer/bounce-arrow/bounce-arrow.js',
//         '/app/testplayer/cls.module.js',
//         '/app/testplayer/core/config.js',
//         '/app/testplayer/core/core.module.js',
//         '/app/testplayer/core/error-handler.js',
//         '/app/testplayer/core/http.config.js',
//         '/app/testplayer/core/mathMl-error-handler.js',
//         '/app/testplayer/intro/intro.css',
//         '/app/testplayer/intro/intro.js',
//         '/app/testplayer/intro/intro.html',
//         '/app/testplayer/intro/intro.module.js',
//         '/app/testplayer/intro/intro.route.js',
//         '/app/testplayer/layout/layout.css',
//         '/app/testplayer/layout/layout.html',
//         '/app/testplayer/layout/layout.js',
//         '/app/testplayer/layout/layout.module.js',
//         '/app/testplayer/layout/layoutService.js',
//         '/app/testplayer/layout/resolution-limited.js',
//         '/app/testplayer/layout/title.component.js',
//         '/app/testplayer/loading-spinner/loading-spinner.html',
//         '/app/testplayer/loading-spinner/loading-spinner.js',
//         '/app/testplayer/loading/loading.css',
//         '/app/testplayer/loading/loading.js',
//         '/app/testplayer/loading/loading.module.js',
//         '/app/testplayer/loading/loadingService.js',
//         '/app/testplayer/media/jmedia-audio.html',
//         '/app/testplayer/media/jmedia-audio.js',
//         '/app/testplayer/media/jmedia-image.html',
//         '/app/testplayer/media/jmedia-image.js',
//         '/app/testplayer/media/jmedia-player.js',
//         '/app/testplayer/media/jmedia-video.html',
//         '/app/testplayer/media/jmedia-video.js',
//         '/app/testplayer/media/jmedia.css',
//         '/app/testplayer/media/jmedia.html',
//         '/app/testplayer/media/jmedia.js',
//         '/app/testplayer/media/media.module.js',
//         '/app/testplayer/modal/alternate-layout-modal/alternate-layout-modal.js',
//         '/app/testplayer/modal/attempt-closed/attempt-closed.js',
//         '/app/testplayer/modal/attempt-closed/attempt-closed.html',
//         '/app/testplayer/modal/attempt-closed/attempt-closed-modal.html',
//         '/app/testplayer/modal/attempt-locked/attempt-locked.js',
//         '/app/testplayer/modal/attempt-locked/attempt-locked.html',
//         '/app/testplayer/modal/attempt-locked/attempt-locked-modal.html',
//         '/app/testplayer/modal/attempt-reopen-failure/attempt-reopen-failure.js',
//         '/app/testplayer/modal/attempt-reopen-failure/attempt-reopen-failure.html',
//         '/app/testplayer/modal/attempt-reopen-failure/attempt-reopen-failure-modal.html',
//         '/app/testplayer/modal/attempt-reopen-timeup/attempt-reopen-timeup.js',
//         '/app/testplayer/modal/attempt-reopen-timeup/attempt-reopen-timeup.html',
//         '/app/testplayer/modal/attempt-reopen-timeup/attempt-reopen-timeup-modal.html',
//         '/app/testplayer/modal/attempt-reopened/attempt-reopened.js',
//         '/app/testplayer/modal/attempt-reopened/attempt-reopened.html',
//         '/app/testplayer/modal/attempt-reopened/attempt-reopened-modal.html',
//         '/app/testplayer/modal/character-limit/character-limit.html',
//         '/app/testplayer/modal/communication-lost/communication-lost.css',
//         '/app/testplayer/modal/communication-lost/communication-lost.js',
//         '/app/testplayer/modal/communication-lost/communication-lost.html',
//         '/app/testplayer/modal/communication-lost/communication-lost-modal.html',
//         '/app/testplayer/modal/confirm-exit-test/confirm-exit-test.js',
//         '/app/testplayer/modal/confirm-exit-test/confirm-exit-test.html',
//         '/app/testplayer/modal/confirm-exit-test/confirm-exit-test-modal.html',
//         '/app/testplayer/modal/confirm-finish-test/confirm-finish-test.js',
//         '/app/testplayer/modal/confirm-finish-test/confirm-finish-test.css',
//         '/app/testplayer/modal/confirm-finish-test/confirm-finish-test.html',
//         '/app/testplayer/modal/confirm-finish-test/confirm-finish-test-modal.html',
//         '/app/testplayer/modal/confirm-logout/confirm-logout.js',
//         '/app/testplayer/modal/confirm-logout/confirm-logout.html',
//         '/app/testplayer/modal/confirm-logout/confirm-logout-modal.html',
//         '/app/testplayer/modal/confirm-return-to-dashboard/confirm-return-to-dashboard.js',
//         '/app/testplayer/modal/confirm-return-to-dashboard/confirm-return-to-dashboard.html',
//         '/app/testplayer/modal/confirm-return-to-dashboard/confirm-return-to-dashboard-modal.html',
//         '/app/testplayer/modal/end-of-section/end-of-section.js',
//         '/app/testplayer/modal/end-of-section/end-of-section.css',
//         '/app/testplayer/modal/end-of-section/end-of-section.html',
//         '/app/testplayer/modal/end-of-section/end-of-section-modal.html',
//         '/app/testplayer/modal/end-of-section/lock-1x.png',
//         '/app/testplayer/modal/end-of-section/lock-2x.png',
//         '/app/testplayer/modal/error/error.js',
//         '/app/testplayer/modal/error/error.css',
//         '/app/testplayer/modal/error/error.html',
//         '/app/testplayer/modal/error/error-modal.html',
//         '/app/testplayer/modal/feedback/feedback.js',
//         '/app/testplayer/modal/feedback/feedback.html',
//         '/app/testplayer/modal/feedback/feedback-modal.html',
//         '/app/testplayer/modal/finish/finish.css',
//         '/app/testplayer/modal/finish/finish.js',
//         '/app/testplayer/modal/finish/finish.route.js',
//         '/app/testplayer/modal/finish/finish.html',
//         '/app/testplayer/modal/out-of-time/out-of-time.js',
//         '/app/testplayer/modal/out-of-time/out-of-time.html',
//         '/app/testplayer/modal/out-of-time/out-of-time-modal.html',
//         '/app/testplayer/modal/pause/pause.html',
//         '/app/testplayer/modal/postponed/postponed.js',
//         '/app/testplayer/modal/postponed/postponed.html',
//         '/app/testplayer/modal/postponed/postponed-modal.html',
//         '/app/testplayer/modal/practice/practice.js',
//         '/app/testplayer/modal/practice/practice.html',
//         '/app/testplayer/modal/practice/practice-modal.html',
//         '/app/testplayer/modal/unauthenticated/unauthenticated.js',
//         '/app/testplayer/modal/unauthenticated/unauthenticated.html',
//         '/app/testplayer/modal/unauthenticated/unauthenticated-modal.html',
//         '/app/testplayer/modal/waiting/waiting.js',
//         '/app/testplayer/modal/waiting/waiting.css',
//         '/app/testplayer/modal/waiting/waiting.html',
//         '/app/testplayer/modal/waiting/waiting-modal.html',
//         '/app/testplayer/modal/waiting/waiting-1x.png',
//         '/app/testplayer/modal/waiting/waiting-2x.png',
//         '/app/testplayer/modal/word-limit/word-limit.html',
//         '/app/testplayer/modal/modal.js',
//         '/app/testplayer/modal/modal.css',
//         '/app/testplayer/modal/modal.html',
//         '/app/testplayer/modal/modal.module.js',
//         '/app/testplayer/modal/modal.route.js',
//         '/app/testplayer/modal/modalService.js',
//         '/app/testplayer/modal/inlineModal.html',
//         '/app/testplayer/modal/inlineModalWindow.html',
//         '/app/testplayer/models/AttemptState.js',
//         '/app/testplayer/models/AttemptStatus.js',
//         '/app/testplayer/models/DistractorShape.js',
//         '/app/testplayer/models/ErrorSeverity.js',
//         '/app/testplayer/models/FeedbackType.js',
//         '/app/testplayer/models/ICompleteSectionResponse.js',
//         '/app/testplayer/models/IDisruption.js',
//         '/app/testplayer/models/QuestionLayout.js',
//         '/app/testplayer/models/QuestionPreviewType.js',
//         '/app/testplayer/models/QuestionType.js',
//         '/app/testplayer/models/QuestionnaireType.js',
//         '/app/testplayer/models/ResourceSetType.js',
//         '/app/testplayer/models/ResourceType.js',
//         '/app/testplayer/models/TestAreaType.js',
//         '/app/testplayer/models/TestSectionNavigationType.js',
//         '/app/testplayer/models/TestSectionType.js',
//         '/app/testplayer/models/WordLimitAction.js',
//         '/app/testplayer/models/alias.js',
//         '/app/testplayer/models/models.module.js',
//         '/app/testplayer/models/qti/QtiInteraction.js',
//         '/app/testplayer/models/qti/canvas/CanvasInteraction.js',
//         '/app/testplayer/models/qti/canvas/canvas-loading-spinner.html',
//         '/app/testplayer/models/qti/canvas/canvas-loading-spinner.js',
//         '/app/testplayer/navigation/linear-nav-buttons/flag-1x.png',
//         '/app/testplayer/navigation/linear-nav-buttons/linear-nav-buttons.css',
//         '/app/testplayer/navigation/linear-nav-buttons/linear-nav-buttons.html',
//         '/app/testplayer/navigation/linear-nav-buttons/linear-nav-buttons.js',
//         '/app/testplayer/navigation/navigation.module.js',
//         '/app/testplayer/navigation/navigationService.js',
//         '/app/testplayer/navigation/question-index/question-index.css',
//         '/app/testplayer/navigation/question-index/question-index.html',
//         '/app/testplayer/navigation/question-index/question-index.js',
//         '/app/testplayer/preview-tools/downloadresponse-preview/downloadresponse-preview.js',
//         '/app/testplayer/preview-tools/integrationtest-preview/integrationtest-preview.css',
//         '/app/testplayer/preview-tools/integrationtest-preview/integrationtest-preview.js',
//         '/app/testplayer/preview-tools/navigation-mode/navigation-mode.css',
//         '/app/testplayer/preview-tools/navigation-mode/navigation-mode.js',
//         '/app/testplayer/preview-tools/pnp-preview/pnp-preview.css',
//         '/app/testplayer/preview-tools/pnp-preview/pnp-preview.js',
//         '/app/testplayer/preview-tools/preview-tools.css',
//         '/app/testplayer/preview-tools/preview-tools.js',
//         '/app/testplayer/preview-tools/preview-tools.module.js',
//         '/app/testplayer/preview-tools/reset-preview/reset-preview.css',
//         '/app/testplayer/preview-tools/reset-preview/reset-preview.js',
//         '/app/testplayer/preview-tools/score-preview/score-preview.css',
//         '/app/testplayer/preview-tools/score-preview/score-preview.js',
//         '/app/testplayer/questions/associate/associate.css',
//         '/app/testplayer/questions/associate/associate.html',
//         '/app/testplayer/questions/associate/associate.js',
//         '/app/testplayer/questions/comment/comment.html',
//         '/app/testplayer/questions/comment/comment.js',
//         '/app/testplayer/questions/common/interaction-destination.html',
//         '/app/testplayer/questions/common/interaction-destination.js',
//         '/app/testplayer/questions/common/interaction-source.html',
//         '/app/testplayer/questions/common/interaction-source.js',
//         '/app/testplayer/questions/common/interaction-sources.html',
//         '/app/testplayer/questions/common/interaction-sources.js',
//         '/app/testplayer/questions/common/stem-interaction.css',
//         '/app/testplayer/questions/common/stem-interaction.js',
//         '/app/testplayer/questions/composite/composite.css',
//         '/app/testplayer/questions/composite/composite.html',
//         '/app/testplayer/questions/composite/composite.js',
//         '/app/testplayer/questions/file-upload/file-upload.css',
//         '/app/testplayer/questions/file-upload/file-upload.html',
//         '/app/testplayer/questions/file-upload/file-upload.js',
//         '/app/testplayer/questions/gap-match/gap-match.css',
//         '/app/testplayer/questions/gap-match/gap-match.html',
//         '/app/testplayer/questions/gap-match/gap-match.js',
//         '/app/testplayer/questions/gap-match/interaction-gap.js',
//         '/app/testplayer/questions/graphic-associate/graphic-associate.html',
//         '/app/testplayer/questions/graphic-associate/graphic-associate.js',
//         '/app/testplayer/questions/graphic-gap-match/graphic-gap-match.html',
//         '/app/testplayer/questions/graphic-gap-match/graphic-gap-match.js',
//         '/app/testplayer/questions/graphic-order/graphic-order.html',
//         '/app/testplayer/questions/graphic-order/graphic-order.js',
//         '/app/testplayer/questions/hotspot/hotspot.html',
//         '/app/testplayer/questions/hotspot/hotspot.js',
//         '/app/testplayer/questions/inline-choice/inline-choice.css',
//         '/app/testplayer/questions/inline-choice/inline-choice.html',
//         '/app/testplayer/questions/inline-choice/inline-choice.js',
//         '/app/testplayer/questions/inline-choice/ui-select.js',
//         '/app/testplayer/questions/keyword/input-restriction.js',
//         '/app/testplayer/questions/keyword/keyword.css',
//         '/app/testplayer/questions/keyword/keyword.html',
//         '/app/testplayer/questions/keyword/keyword.js',
//         '/app/testplayer/questions/match-interaction/match-interaction-checkboxes.js',
//         '/app/testplayer/questions/match-interaction/match-interaction-dragdrop.js',
//         '/app/testplayer/questions/match-interaction/match-interaction-drawlines.js',
//         '/app/testplayer/questions/match-interaction/match-interaction.css',
//         '/app/testplayer/questions/match-interaction/match-interaction.html',
//         '/app/testplayer/questions/match-interaction/match-interaction.js',
//         '/app/testplayer/questions/multiple-choice/multiple-choice.css',
//         '/app/testplayer/questions/multiple-choice/multiple-choice.html',
//         '/app/testplayer/questions/multiple-choice/multiple-choice.js',
//         '/app/testplayer/questions/not-implemented/not-implemented.html',
//         '/app/testplayer/questions/not-implemented/not-implemented.js',
//         '/app/testplayer/questions/order/order.css',
//         '/app/testplayer/questions/order/order.html',
//         '/app/testplayer/questions/order/order.js',
//         '/app/testplayer/questions/position-object/position-object-destination.html',
//         '/app/testplayer/questions/position-object/position-object-destination.js',
//         '/app/testplayer/questions/position-object/position-object.css',
//         '/app/testplayer/questions/position-object/position-object.html',
//         '/app/testplayer/questions/position-object/position-object.js',
//         '/app/testplayer/questions/question-types.html',
//         '/app/testplayer/questions/questionService.js',
//         '/app/testplayer/questions/questions.css',
//         '/app/testplayer/questions/questions.html',
//         '/app/testplayer/questions/questions.js',
//         '/app/testplayer/questions/questions.module.js',
//         '/app/testplayer/questions/questions.route.js',
//         '/app/testplayer/questions/select-point/point.js',
//         '/app/testplayer/questions/select-point/select-point.css',
//         '/app/testplayer/questions/select-point/select-point.html',
//         '/app/testplayer/questions/select-point/select-point.js',
//         '/app/testplayer/questions/short-answer/code-editor.js',
//         '/app/testplayer/questions/short-answer/rich-text-editor.js',
//         '/app/testplayer/questions/short-answer/short-answer.css',
//         '/app/testplayer/questions/short-answer/short-answer.html',
//         '/app/testplayer/questions/short-answer/short-answer.js',
//         '/app/testplayer/questions/slider/slider.css',
//         '/app/testplayer/questions/slider/slider.html',
//         '/app/testplayer/questions/slider/slider.js',
//         '/app/testplayer/questions/slider/ui-slider.js',
//         '/app/testplayer/questions/text-spot-interaction/text-spot-interaction.css',
//         '/app/testplayer/questions/text-spot-interaction/text-spot-interaction.html',
//         '/app/testplayer/questions/text-spot-interaction/text-spot-interaction.js',
//         '/app/testplayer/questions/text-spot-interaction/text-spot.js',
//         '/app/testplayer/services/attemptService.js',
//         '/app/testplayer/services/cookieService.js',
//         '/app/testplayer/services/imageService.js',
//         '/app/testplayer/services/invigilationService.js',
//         '/app/testplayer/services/rtpService.js',
//         '/app/testplayer/services/services.module.js',
//         '/app/testplayer/services/startupService.js',
//         '/app/testplayer/services/summaryService.js',
//         '/app/testplayer/stimuli/stimuli.css',
//         '/app/testplayer/stimuli/stimuli.html',
//         '/app/testplayer/stimuli/stimuli.js',
//         '/app/testplayer/stimuli/stimuli.module.js',
//         '/app/testplayer/survey/survey.css',
//         '/app/testplayer/survey/survey.js',
//         '/app/testplayer/survey/survey.module.js',
//         '/app/testplayer/survey/survey.route.js',
//         '/app/testplayer/test-dashboard/test-dashboard.css',
//         '/app/testplayer/test-dashboard/test-dashboard.js',
//         '/app/testplayer/test-dashboard/test-dashboard.module.js',
//         '/app/testplayer/testplayer.module.js',
//         '/app/testplayer/timer/timer.config.js',
//         '/app/testplayer/timer/timer.css',
//         '/app/testplayer/timer/timer.html',
//         '/app/testplayer/timer/timer.js',
//         '/app/testplayer/timer/timer.module.js',
//         '/app/testplayer/timer/timerService.js',
//         '/app/testplayer/tools/audio/audio.css',
//         '/app/testplayer/tools/audio/audio.html',
//         '/app/testplayer/tools/audio/audio.js',
//         '/app/testplayer/tools/audio/audioService.js',
//         '/app/testplayer/tools/audio/header-audio.css',
//         '/app/testplayer/tools/audio/header-audio.html',
//         '/app/testplayer/tools/audio/header-audio.js',
//         '/app/testplayer/tools/calculator/calculator.css',
//         '/app/testplayer/tools/calculator/calculator.html',
//         '/app/testplayer/tools/calculator/calculator.js',
//         '/app/testplayer/tools/protractor/protractor-tool-2x.png',
//         '/app/testplayer/tools/protractor/protractor.css',
//         '/app/testplayer/tools/protractor/protractor.html',
//         '/app/testplayer/tools/protractor/protractor.js',
//         '/app/testplayer/tools/ruler/ruler-tool-2x.png',
//         '/app/testplayer/tools/ruler/ruler.css',
//         '/app/testplayer/tools/ruler/ruler.html',
//         '/app/testplayer/tools/ruler/ruler.js',
//         '/app/testplayer/tools/test-audio/test-audio.css',
//         '/app/testplayer/tools/test-audio/test-audio.html',
//         '/app/testplayer/tools/test-audio/test-audio.js',
//         '/app/testplayer/tools/test-audio/testAudioService.js',
//         '/app/testplayer/tools/tools.css',
//         '/app/testplayer/tools/tools.html',
//         '/app/testplayer/tools/tools.js',
//         '/app/testplayer/tools/tools.module.js',
//         '/app/testplayer/tools/tools.service.js',
//         '/app/testplayer/tools/zoom/zoom.css',
//         '/app/testplayer/tools/zoom/zoom.html',
//         '/app/testplayer/tools/zoom/zoom.js',
//         '/app/testplayer/tools/zoom/zoomService.js',
//         '/app/testplayer/writing-task/writing-task-stimuli.js',
//         '/app/testplayer/writing-task/writing-task.css',
//         '/app/testplayer/writing-task/writing-task.js',
//         '/app/testplayer/writing-task/writing-task.html',
//         '/app/testplayer/writing-task/writing-task.module.js',
//         '/app/testplayer/writing-task/writing-task.route.js',
//         '/app/tp2.colours.css',
//         '/app/typings/generated/JService.Areas.Answer.js',
//         '/app/typings/generated/JService.Areas.Taxonomy.js',
//         '/app/typings/generated/JService.Areas.TestAttempt.js',
//         '/app/typings/generated/JService.Common.Models.js',
//         '/app/typings/generated/JService.Config.js',
//         '/app/typings/generated/JService.Services.Accreditations.js',
//         '/app/typings/generated/JService.Services.Enrolment.Transcripts.js',
//         '/app/typings/generated/JService.Services.LearningEvent.js',
//         '/app/typings/generated/JService.Services.MyLearning.Models.js',
//         '/app/typings/generated/JService.Services.Payment.js',
//         '/app/typings/generated/JService.Services.Portfolio.js',
//         '/app/typings/generated/JService.Services.SAMLServiceProvider.js',
//         '/app/typings/generated/JService.Services.Subscriptions.js',
//         '/app/typings/generated/JService.Services.Tags.js',
//         '/app/typings/generated/JService.Services.Taxonomy.js',
//         '/app/typings/generated/JService.js',
//         '/app/typings/generated/Janison.Assessment.DataTypes.TestPlayer2.Models.js',
//         '/app/typings/generated/Janison.Assessment.DataTypes.TestPlayerModels.js',
//         '/app/typings/generated/Janison.Assessment.DataTypes.js',
//         '/app/typings/generated/Janison.AssessmentEvents.Areas.AssessmentEvents.Models.js',
//         '/app/typings/generated/Janison.AssessmentEvents.Areas.Monitor.Models.SSSR.js',
//         '/app/typings/generated/Janison.Assignment.Areas.Assignment.Models.js',
//         '/app/typings/generated/Janison.Auth.Models.js',
//         '/app/typings/generated/Janison.Bostes.AccreditationService.js',
//         '/app/typings/generated/Janison.Bostes.Areas.Bostes.Models.js',
//         '/app/typings/generated/Janison.EF.js',
//         '/app/typings/generated/Janison.Enrolments.Areas.Transcripts.Models.js',
//         '/app/typings/generated/Janison.Enrolments.Contracts.js',
//         '/app/typings/generated/Janison.LearningManager.Areas.LearningManager.Models.js',
//         '/app/typings/generated/Janison.Marking.Extended.Models.AES.js',
//         '/app/typings/generated/Janison.Marking.Extended.Models.js',
//         '/app/typings/generated/Janison.Marking.Extended.js',
//         '/app/typings/generated/Janison.Microservices.DataTypes.Services.js',
//         '/app/typings/generated/Janison.Microservices.DataTypes.js',
//         '/app/typings/generated/Janison.Organisation.Models.js',
//         '/app/typings/generated/Janison.Settings.Areas.Settings.Models.js',
//         '/app/typings/generated/Janison.TestPlayer.Areas.TestPlayer.Models.PlayerPreviewModel.js',
//         '/app/typings/generated/Janison.TestPlayer2.Areas.TestPlayer2.Models.js',
//         '/app/typings/generated/Janison.Web.UI.Infrastructure.js',
//         '/app/typings/generated/Janison.WebPortal.BaseController.js',
//         '/app/typings/generated/Janison.WebPortal.Contracts.Areas.Common.Models.js',
//         '/app/typings/generated/Janison.WebPortal.Contracts.Contracts.js',
//         '/app/typings/generated/Janison.WebPortal.Contracts.Models.SearchExportModel.js',
//         '/app/typings/generated/Janison.WebPortal.Contracts.Models.js',
//         '/app/typings/generated/Janison.WebPortal.Contracts.Presentation.Program.js',
//         '/app/typings/generated/Janison.WebPortal.Contracts.Services.Reports.js',
//         '/app/typings/generated/Janison.WebPortal.Parts.SystemMessage.js',
//         '/app/typings/generated/Janison.WebPortal.Parts.js',
//         '/app/typings/generated/System.Collections.Generic.js',
//         '/app/vendor/angular-ui/pager.js',
//         '/app/vendor/angular-ui/pagination.js',
//         '/app/vendor/angular-ui/paging.js',
//         '/app/vendor/animate/animate.css',
//         '/app/vendor/bootstrap-3.3.5/javascripts/bootstrap.js',
//         '/app/vendor/bootstrap-select/bootstrap-select.css',
//         '/app/vendor/bootstrap-select/bootstrap-select.js',
//         '/app/vendor/bootstrap-slider/bootstrap-slider.js',
//         '/app/vendor/eventemitter3/eventemitter3.js',
//         '/app/vendor/fabricjs-1.6.0-rc.1/fabric.js',
//         '/app/vendor/fonts/fontawesome-webfont.css',
//         '/app/vendor/fonts/fontawesome-webfont.woff?v=4.2.0',
//         '/app/vendor/jquery-ui-1.11.4.custom/jquery-ui.css',
//         '/app/vendor/jquery-ui-1.11.4.custom/jquery-ui.js',
//         '/app/vendor/jquery-ui-1.11.4.custom/jquery-ui.theme.css',
//         '/app/vendor/jquery-ui-rotatable/jquery-ui-rotatable.js',
//         '/app/vendor/jquery-ui-touch-punch/jquery.ui.touch-punch.js',
//         '/app/vendor/jquery.extension.js',
//         '/app/vendor/metadata/Reflect.js',
//         '/app/vendor/metadata/metawriter.js',
//         '/app/vendor/rangy-inputs/rangy-inputs.js',
//         '/app/vendor/timer/humanize-duration.js',
//         '/app/vendor/tinymce/skins/lightgray/fonts/tinymce.css',
//         '/app/vendor/ts-eventemitter/ts-eventemitter.js',
//         '/app/vendor/ui-sortable/sortable.js',
//         '/app/vendor/video-js/video-js.css',
//         '/app/vendor/video-js/video.js',
//     ];
// }
// //# sourceMappingURL=rtpServiceWorker.js.map
*/
