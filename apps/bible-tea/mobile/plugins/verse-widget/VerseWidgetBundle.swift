import WidgetKit
import SwiftUI

@main
struct VerseWidgetBundle: WidgetBundle {
    var body: some Widget {
        VerseWidget()
        if #available(iOSApplicationExtension 16.1, *) {
            VerseAccessoryWidget()
        }
    }
}
