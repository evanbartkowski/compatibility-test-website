import {describe,it,expect} from 'vitest';
import {getAssessmentBySlug} from '@/data/assessments/catalog';
import {scoreAssessmentSubmission} from '@/lib/assessment/scoring';
import {projectPrivateExport} from '@/lib/exports/private-export';
describe('Private export choices',()=>{
 it('omits sensitive categories and individual answers unless deliberately selected',()=>{const assessment=getAssessmentBySlug('intimacy-partner-preferences')!,q=assessment.questions[0];const result=scoreAssessmentSubmission({assessment,mode:'quick',perspective:'primary',resultId:'export',answers:{[q.id]:{questionId:q.id,enjoyment:5,updatedAt:''}}});const safe=projectPrivateExport(result,{includeAnswers:false,includeSensitive:false});expect(safe.radar).toEqual([]);expect(JSON.stringify(safe)).not.toContain(q.prompt);const categories=projectPrivateExport(result,{includeAnswers:false,includeSensitive:true});expect(categories.radar.length).toBeGreaterThan(0);expect(JSON.stringify(categories)).not.toContain(q.prompt);expect(projectPrivateExport(result,{includeAnswers:true,includeSensitive:true})).toEqual(result);});
});
