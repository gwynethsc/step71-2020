import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute, ParamMap } from '@angular/router'; 
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Project } from '../project';
import { ProjectFile } from '../project-file';
import { ToggleChatService } from '../toggle-chat.service';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {

  private blobstoreUploadUrl: string;
  project$: Observable<Project>;
  files$: Observable<ProjectFile[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private chatService: ToggleChatService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let title = params.get('id');
      this.project$ = this.projectService.getProject(title);
      this.files$ = this.projectService.getProjectFiles(title);
    }
    );
  }

  setBlobstoreUploadUrl(): void {
    this.projectService.getBlobstoreUploadUrl().subscribe(
      url => { 
        this.blobstoreUploadUrl = url;
        console.log("blobstore upload URL set");
      },
      error => console.log("Error getting blobstore upload URL: " + error)
    );
  }

  openDialog(project): void {
    this.dialog.open(ProjectSettingsDialog, { data: project });
  }

  toggleChat(): void {
    console.log("toggling chat");
    this.chatService.toggle();
  }

  upload(project, event): void {
    if (event.target.files.length > 0) {
      let file: File = event.target.files[0];
      this.projectService.uploadFile(this.blobstoreUploadUrl, project, file);
      event.target.value = '';
    }
  }
}

@Component({
  selector: 'app-project-settings-dialog',
  templateUrl: 'project-settings-dialog.html',
})
export class ProjectSettingsDialog {

  constructor(
    public dialogRef: MatDialogRef<ProjectSettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public project: Project) {}

  exitSettings() {
    this.dialogRef.close();
  }
}
